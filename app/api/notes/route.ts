import { createNoteSchema } from "@/lib/validation/note";
import { auth } from "@clerk/nextjs";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import prisma from "@/lib/db/prismaSingelton";
import { metadata } from "@/app/layout";

export async function POST(req: Request) {
  try {
    console.log("Starting POST request processing");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const notesIndex = pc.Index("notes-gpt");

    const body = await req.json();
    console.log("Request body parsed");
    const validation = createNoteSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation failed", validation.error);
      return Response.json({ error: "Invalid note" }, { status: 400 });
    }
    const { title, content, labelId } = validation.data; // Use labelId here
    const { userId } = auth();
    console.log(`Authenticated user ID: ${userId}`);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const noteText = `${title}\n${content}`;
    console.log("Creating text embedding");
    const createEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: noteText,
    });
    const noteEmbedding = createEmbedding.data[0].embedding;
    console.log("Embedding created, proceeding to database transaction");
    const createNote = await prisma.$transaction(async (tx) => {
      const createNote = await tx.note.create({
        data: {
          title,
          content,
          userId,
          label: {
            connect: { id: labelId },
          },
        },
      });
      await notesIndex.upsert([
        {
          id: createNote.id,
          values: noteEmbedding,
          metadata: { userId },
        },
      ]);
      return createNote;
    });
    console.log("Note created and indexed successfully");
    return Response.json({ createNote }, { status: 201 });
  } catch (error) {
    console.error("An error occurred", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
