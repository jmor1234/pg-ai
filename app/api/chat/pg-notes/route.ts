import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { AnthropicStream, StreamingTextResponse } from "ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prismaSingelton";

export async function POST(req: Request) {
  try {
    console.log("Initializing OpenAI, Anthropic and Pinecone clients...");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pgIndex = pc.Index("pg-ai");
    const notesIndex = pc.Index("notes-gpt");

    const { messages } = await req.json();
    console.log(
      `Received ${messages.length} messages. Processing the last 6 messages...`
    );
    const lastSixMess = messages.slice(-6);
    const lastSixMessEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: lastSixMess
        .map((message: { role: string; content: string }) => {
          return message.content;
        })
        .join("\n"),
    });

    console.log("Embedding created. Querying the Pinecone indexes...");
    const embedding = lastSixMessEmbedding.data[0].embedding;

    const { userId } = auth();
    const [pgQueryResponse, notesQueryResponse] = await Promise.all([
      pgIndex.query({
        topK: 10,
        vector: embedding,
        includeMetadata: true,
      }),
      notesIndex.query({
        topK: 5,
        vector: embedding,
        filter: { userId: userId },
      }),
    ]);

    console.log("Queries completed. Processing matches...");
    const pgMatches = pgQueryResponse.matches.map((match) => {
      if (match.metadata) {
        return {
          title: match.metadata.essay_title,
          url: match.metadata.essay_url,
          content: match.metadata.content,
        };
      } else {
        return {
          title: "Unknown Title",
          url: "#",
          content: "No content available",
        };
      }
    });

    const relevantNotes = await prisma.note.findMany({
      where: {
        id: { in: notesQueryResponse.matches.map((match) => match.id) },
      },
    });

    const systemMessage = `
<role>
You are a knowledgeable assistant that provides insightful and personalized responses by drawing upon the wisdom from Paul Graham's essays and the user's personal notes. 
Engage in thoughtful conversation, seamlessly integrating relevant insights from both sources. 
Aim for a friendly yet intellectual tone, providing detailed responses that demonstrate a deep understanding of the material.
</role>

<paulGrahamEssaySnippets>
${pgMatches
  .map(
    (match) => 
      `Title: ${match.title}
        URL: ${match.url}
        Content: ${match.content}`
  )
  .join(`\n\n`)}
</paulGrahamEssaySnippets>

<userNotesSnippets>
${relevantNotes
  .map(
    (note) =>
      `Title: ${note.title}
        Content: ${note.content}`
  )
  .join(`\n\n`)}
</userNotesSnippets>

<instructions>
1. Carefully review the provided snippets from both Paul Graham's essays (<paulGrahamEssaySnippets>) and the user's notes (<userNotesSnippets>).

2. Consider how the information in the snippets relates to the user's input. Identify key insights and themes that can inform your response.

3. Provide a comprehensive and insightful response to the user's input, drawing upon relevant information from both the essays and notes. 

4. Quote or paraphrase key details from the snippets to enrich your response and provide a personalized experience. Cite the source of each quote or paraphrase.

5. If the user asks a question, answer it to the best of your ability using the combined knowledge from the essays and notes.

6. If the user provides a quote, delve deeper into its meaning and significance by examining it through the lens of the essays and the user's personal context from their notes.

7. If the snippets are not directly relevant to the user's input, acknowledge this and continue the conversation based on your general knowledge and understanding.

8. After your response, include a list of the essay titles and note titles you referenced, if any, formatted as:

<referencedEssays>
- Title 1 (URL)
- Title 2 (URL)
</referencedEssays>

<referencedNotes>
- Title A
- Title B
</referencedNotes>
</instructions>

<responseExample>
The snippets from Paul Graham's essays and your notes provide some interesting perspectives on the topic of [user's input topic]. 

In his essay "[Relevant Essay Title]," Graham argues that [key insight], stating "[relevant quote]" ([essay URL]). This aligns with the point you made in your "[Relevant Note Title]" note about [connection to user's idea].

Additionally, your notes on "[Another Relevant Note Title]" highlight [another key insight], which Graham touches upon in "[Another Relevant Essay Title]," where he observes, "[another relevant quote]" ([essay URL]).

Considering these insights together, it seems that [synthesized perspective on user's input topic]. Of course, as Graham acknowledges in "[Tangentially Relevant Essay Title]," "[qualifying quote]" ([essay URL]), so it's important to [concluding advice or perspective].

<referencedEssays>
- Relevant Essay Title (URL)
- Another Relevant Essay Title (URL) 
- Tangentially Relevant Essay Title (URL)
</referencedEssays>

<referencedNotes>
- Relevant Note Title
- Another Relevant Note Title
</referencedNotes>
</responseExample>
    `;

    console.log(`System Message: ${systemMessage}`);
    console.log(`Messages: ${JSON.stringify(messages, null, 2)}`);

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      stream: true,
      system: systemMessage,
      messages,
      max_tokens: 4000,
      temperature: 0.5,
    });
    const stream = AnthropicStream(response);
    console.log("Chat completion generated. Streaming response...");
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}