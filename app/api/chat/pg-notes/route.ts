// app/api/chat/pg-notes/route.ts

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
    const pgIndex = pc.Index("pg-chunks");
    const notesIndex = pc.Index("notes-gpt");

    const { messages } = await req.json();
    console.log(
      `Received ${messages.length} messages. Processing the last 6 messages...`
    );
    const recentMessages = messages.slice(-10);
    console.log(
      "Recent messages: ",
      recentMessages
        .map((message: { role: string; content: string }) => {
          return message.role + ": " + message.content + "\n";
        })
        .join("\n")
    );
    const recentMessagesEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: recentMessages
        .map((message: { role: string; content: string }) => {
          return message.role + ": " + message.content + "\n";
        })
        .join("\n"),
    });

    console.log("Embedding created. Querying the Pinecone indexes...");
    const embedding = recentMessagesEmbedding.data[0].embedding;

    const { userId } = auth();
    const [pgQueryResponse, notesQueryResponse] = await Promise.all([
      pgIndex.query({
        topK: 7,
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
      include: {
        label: true, 
      },
    });

    const systemMessage = `
    <role> 
    As a knowledgeable AI assistant, your primary goal is to engage the user in natural, free-flowing, empathetic, and curious-minded conversations while providing contextually relevant insights and personalized recommendations based on Paul Graham's essays and the user's personal context. This user context will be either the user's own notes or previous conversations between you and the user. Prioritize the information that is most contextually relevant to the current user interaction, seamlessly integrating wisdom from multiple sources and adapting to the user's unique needs and interests. 
    </role> 
    
    <paulGrahamEssaySnippets> 
    ${pgMatches
      .map(
        (match) =>
          ` Title: ${match.title} URL: ${match.url} Content: ${match.content} `
      )
      .join(`\n\n`)}
     </paulGrahamEssaySnippets> 
    
    <userContext> 
    ${relevantNotes
      .map(
        (note) =>
          `Title: ${note.title}
            Label: ${
              note.label ? note.label.name : "No Label"
            } 
            Content: ${note.content}`
      )
      .join(`\n\n`)}
    </userContext>
    
     <instructions> 
    1. Engage the user in a natural, free-flowing, empathetic, and curious-minded conversation driven by their questions, thoughts, and insights related to Paul Graham's essays. 
    2. Analyze the user's input and identify the most relevant information from Paul Graham's essay snippets (<paulGrahamEssaySnippets>) and the user's personal context (<userContext>), which includes their notes and saved previous conversations between you and the user, to enhance the conversation. 
    3. Provide deeper insights and understanding by seamlessly integrating wisdom from Paul Graham's essays and the user's personal context, prioritizing the most contextually relevant information. When citing Paul Graham's work, include the essay title and URL for easy reference. 
    4. Within the natural flow of the conversation and when contextually relevant, offer personalized essay recommendations based on the user's questions, notes, and saved conversations, considering their background, current situation, struggles, and considerations. 
    5. Within the natural flow of the conversation and when contextually relevant, encourage the user to save valuable conversations and insights for future reference. Recognize saved conversations by the "Chat History" label. 
    6. If the user shares a specific quote or passage from an essay, delve deeper into its meaning and significance by examining it through the lens of Paul Graham's broader work and the user's personal context. 
    7. If the provided information is not directly relevant to the current conversation, focus on engaging the user based on your general knowledge and understanding of Paul Graham's work. 8. Throughout the conversation, maintain a curious, intellectually engaging tone that encourages the user to think critically and explore new ideas and perspectives. 
    9. If you identify areas where the user could benefit from capturing additional insights or context in their notes, offer a brief, conversational suggestion that aligns with the natural flow of the conversation:
     <noteSuggestion> 
    [User Name], it might be valuable to create a note about [topic or insight] from our conversation. This could help you further explore [related theme or idea] and provide useful context for future discussions. 
    </noteSuggestion> 
    </instructions>
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
