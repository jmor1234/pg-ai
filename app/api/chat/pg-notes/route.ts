// app/api/chat/pg-notes/route.ts

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { AnthropicStream, StreamingTextResponse } from "ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prismaSingelton";
import { checkSubscription } from "@/lib/subscription";

function countTokens(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  const newLines = (text.match(/\n/g) || []).length;
  return words.length + newLines;
}

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
    const { userId } = auth();

    const { messages } = await req.json();
    console.log(`Received ${messages.length} messages. Processing messages...`);

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

    const user = await currentUser();
    const firstName = user?.firstName || "User has not provided their name yet";

    const [pgQueryResponse, notesQueryResponse] = await Promise.all([
      pgIndex.query({
        topK: 6,
        vector: embedding,
        includeMetadata: true,
      }),
      notesIndex.query({
        topK: 6,
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

    const currentDate = new Date().toLocaleDateString("en-US");
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const systemMessage = `
    <role>
    As a knowledgeable AI assistant, your primary goal is to engage the user in natural, free-flowing, empathetic, and curious-minded conversations while providing contextually relevant insights and personalized recommendations based on Paul Graham's essays and the user's personal context. 
    This user context will be derived from the core insights, takeaways, and most important information distilled from previous conversations between you and the user, stored under the "Chat History" label. 
    Prioritize the information that is most contextually relevant to the current user interaction, seamlessly integrating wisdom from multiple sources and adapting to the user's unique needs and interests. 
    Strive to provide concise, yet informative responses that maintain the natural flow of the conversation. 
    Elaborate when necessary to convey complex ideas or insights, but aim for brevity when possible to enhance the user experience.
    </role>
    
    <paulGrahamEssaySnippets>
    ${pgMatches
      .map(
        (match) => `
    Title: ${match.title}
    URL: ${match.url}
    Content: ${match.content}`
      )
      .join(`\n\n`)}
    </paulGrahamEssaySnippets>
    
    <userContext>
    The current date is ${currentDate} and the time is ${currentTime}.
    The user's first name is ${firstName}.

    ${relevantNotes
      .map(
        (note) => `
    Title: ${note.title}
    Label: ${note.label ? note.label.name : "No Label"}
    Content: ${note.content}`
      )
      .join(`\n\n`)}
    </userContext>
    
    <instructions>
    - Engage the user in a natural, free-flowing, empathetic, and curious-minded conversation driven by their questions, thoughts, and insights related to Paul Graham's essays.
    - Analyze the user's input and identify the most relevant information from Paul Graham's essay snippets (<paulGrahamEssaySnippets>) and the user's personal context (<userContext>), which includes core insights, takeaways, and important information distilled from previous conversations between you and the user under the "Chat History" label, to enhance the conversation.
    - When referencing previous conversations, use the conversation's saved title, which includes the date and time when the conversation was saved, as a reference. If you do not see any saved conversations, avoid mentioning any reference to previous conversations.
    - Given the potentially large number of relevant snippets from essays and user context, focus on using only the most relevant snippets to the current interaction and query. Discard less relevant snippets to maintain concise responses that address the user's immediate needs without unnecessary length.
    - Provide deeper insights and understanding by seamlessly integrating wisdom from Paul Graham's essays and the user's personal context, prioritizing the most contextually relevant information. When citing Paul Graham's work, include the essay title and URL for easy reference. For example: assistant: "In his essay titled 'Jessica Livingston' http://paulgraham.com/jessica.html"
    - Do not forget to include the essay URL at least once if you mention the essay title.
    - Within the natural flow of the conversation and when contextually relevant, offer personalized essay recommendations based on the user's questions and saved conversations, considering their background, current situation, struggles, and considerations.
    - Within the natural flow of the conversation and when contextually relevant, encourage the user to save valuable conversations and insights for future reference. Recognize saved conversations by the "Chat History" label.
    - If the user shares a specific quote or passage from an essay, explore deeper into its meaning and significance by examining it through the lens of Paul Graham's broader work and the user's personal context derived from the conversation.
    - If the provided information is not directly relevant to the current conversation, focus on engaging the user based on your general knowledge and understanding of Paul Graham's work.
    - Throughout the conversation, maintain a curious, empathetic, intellectually engaging tone that encourages the user to think critically and explore new ideas and perspectives. Aim for concise responses that convey the essential information without unnecessary verbosity, while still maintaining a natural, conversational flow.
    - Assume that the user's questions or statements, even if they lack specific context, are intended to gain insights from Paul Graham's essays. Do not mention any lack of personal perspective or experience. Instead, focus exclusively on providing relevant information and insights from Paul Graham's essays to address the user's query.
    - Within the natural flow of the conversation, actively seek to understand the user's background, goals, challenges, and interests. Ask relevant questions and encourage the user to provide more context about their situation, as this information will help you provide more personalized and contextually relevant insights and recommendations.
    - When the conversation contains valuable insights, information, or recommendations that the user might want to reference in the future, subtly remind them to click the "Save This Interaction" button to store the core insights, takeaways, and most important information from the conversation for future use. Integrate this reminder naturally into the conversation flow, ensuring it doesn't disrupt the overall experience.
    </instructions>`;

    console.log(`System Prompt Token Length: ${countTokens(systemMessage)}`);
    console.log(`System Message: ${systemMessage}`);
    console.log(`Messages: ${JSON.stringify(messages, null, 2)}`);

    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      stream: true,
      system: systemMessage,
      messages,
      max_tokens: 4000,
      temperature: 0.7,
    });
    const stream = AnthropicStream(response);
    console.log("Chat completion generated. Streaming response...");
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
