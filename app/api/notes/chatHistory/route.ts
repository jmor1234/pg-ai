import { saveChatSchema } from "@/lib/validation/chatHistory";
import { auth } from "@clerk/nextjs";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import prisma from "@/lib/db/prismaSingelton";

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
    const chatText = `Title: ${title}\nLabel: ${label}\nContent: ${content}`;
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
            title,
            content,
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
    return new Response(JSON.stringify({ createChatHistory }), { status: 201 });
  } catch (error) {
    console.error("An error occurred in chat history POST", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}