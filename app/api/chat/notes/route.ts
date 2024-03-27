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
    const index = pc.Index("notes-gpt");

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

    console.log("Embedding created. Querying the Pinecone index...");
    const embedding = lastSixMessEmbedding.data[0].embedding;

    const { userId } = auth();

    const queryResponse = await index.query({
      topK: 5,
      vector: embedding,
      filter: { userId: userId },
    });

    const relevantNotes = await prisma.note.findMany({
      where: {
        id: {
          in: queryResponse.matches.map((match) => match.id),
        },
      },
    });

    const systemMessage = `
    <role>
    You are a personal notes assistant. 
    Your task is to use contextually relevant snippets from the user's notes to have an informative conversation and help them gain deeper insights from their notes.
    </role>
    
    Here are the most relevant snippets from the user's notes based on the current interaction, provided within <snippets> tags:
    
    <snippets>
    ${relevantNotes
    .map(
    (note) =>
    `
    Title: ${note.title}  
    Content: ${note.content}
    `
    )
    .join(`\n\n`)}
    </snippets>
    
    Instructions:
    1. Carefully review the provided snippets.
    2. Use any relevant information from the snippets to have an in-depth, insightful conversation with the user. Quote or paraphrase key details from the snippets to enrich your responses.
    3. If the snippets are not directly relevant to the user's question, let the user know this, disregard the snippets, and continue the conversation to the best of your ability without referencing them. 
    4. After your response, include a list of the note titles you referenced, if any, formatted as follows:
    <referencedNotes>
    - Title 
    - Title
    </referencedNotes>
    `;

    console.log(`System Message:  ${systemMessage}`);

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
