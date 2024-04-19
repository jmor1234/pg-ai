import { saveChatSchema } from "@/lib/validation/chatHistory";
import { auth } from "@clerk/nextjs";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import prisma from "@/lib/db/prismaSingelton";

function countTokens(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  const newLines = (text.match(/\n/g) || []).length;
  return words.length + newLines;
}

const maxContentTokens = 1000; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const chatHistoryIndex = pc.Index("notes-gpt");

export async function POST(req: Request) {
  try {
    console.log("Starting POST request processing for chat history");
    const body = await req.json();
    console.log("Request body parsed for chat history");
    const validation = saveChatSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation failed for chat history", validation.error);
      return new Response(JSON.stringify({ error: "Invalid chat data" }), { status: 400 });
    }
    const { title, content, label } = validation.data;
    const { userId } = auth();
    console.log(`Authenticated user ID: ${userId}`);
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const labelId = await prisma.label.findFirst({
      where: { name: label },
      select: { id: true },
    });
    if (!labelId) {
      console.error("Label not found for chat history");
      return new Response(JSON.stringify({ error: "Label not found" }), { status: 404 });
    }

    console.log(`Content Token Length: ${countTokens(content)}`)
    const contentChunks: string[] = [];
    let currentChunk = "";
    const elements = content.split(/(\nuser: |\nassistant: )/g);

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (/^\s*$/.test(element)) {
        continue; // Skip empty lines
      }
      // Check if the element is a label or content
      if (element === "\nuser: " || element === "\nassistant: ") {
        // If currentChunk is not empty and next element (content) would exceed token limit, push currentChunk
        if (currentChunk && countTokens(currentChunk + elements[i + 1]) > maxContentTokens) {
          contentChunks.push(currentChunk);
          currentChunk = "";
        }
        // Append label to currentChunk
        currentChunk += element;
      } else {
        // Append content to currentChunk
        currentChunk += element;
      }
    }
    if (currentChunk.trim().length > 0) {
      contentChunks.push(currentChunk);
    }

    for (let i = 0; i < contentChunks.length; i++) {
      const chunkTitle = contentChunks.length > 1 ? `${title} (Part ${i + 1})` : title; // Conditionally modify title
      const chatText = `Title: ${chunkTitle}\nLabel: ${label}\nContent: ${contentChunks[i]}`;
      console.log("Text to be embedded for chat history:", chatText);
      const createEmbedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chatText,
      });
      const chatEmbedding = createEmbedding.data[0].embedding;
      console.log("Embedding created for chat history, proceeding to database transaction");
      const createChatHistory = await prisma.$transaction(async (tx) => {
        const createChatHistory = await tx.note.create({
          data: {
              title: chunkTitle,
              content: contentChunks[i],
              userId,
              label: {
                connect: { id: labelId.id },
              },
            },
        });
        await chatHistoryIndex.upsert([
          {
            id: createChatHistory.id,
            values: chatEmbedding,
            metadata: { userId },
          },
        ]);
        return createChatHistory;
      });
      console.log("Chat history created and indexed successfully");
    }
    return new Response(JSON.stringify({ message: "Chat histories created and indexed successfully" }), { status: 201 });
  } catch (error) {
    console.error("An error occurred in chat history POST", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}