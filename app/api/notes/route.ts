import {
  createNoteSchema,
  updateNoteSchema,
  deleteNoteSchema,
} from "@/lib/validation/note";
import { auth } from "@clerk/nextjs";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import prisma from "@/lib/db/prismaSingelton";
import { metadata } from "@/app/layout";
import { countTokens } from "@anthropic-ai/tokenizer";

const maxContentTokens = 1000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const notesIndex = pc.Index("notes-gpt");

export async function POST(req: Request) {
  try {
    console.log("Starting POST request processing");
    const body = await req.json();
    console.log("Request body parsed");
    const validation = createNoteSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation failed", validation.error);
      return Response.json({ error: "Invalid note" }, { status: 400 });
    }
    const { title = "", content = "", labelId = "" } = validation.data;
    const { userId } = auth();
    console.log(`Authenticated user ID: ${userId}`);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const label = await prisma.label.findUnique({
      where: { id: labelId },
    });
    if (!label) {
      console.error("Label not found");
      return Response.json({ error: "Label not found" }, { status: 404 });
    }

    console.log(`Content Token Length: ${countTokens(content)}`)
    const contentChunks: string[] = [];
    let currentChunk = "";
    const elements = content.split(/(?<=\n|\.|\?|!)/g);

    for (const element of elements) {
      if (element === "\n" || /^\s*$/.test(element)) {
        currentChunk += element;
      } else {
        const testChunk = currentChunk + element;
        if (countTokens(testChunk) <= maxContentTokens) {
          currentChunk = testChunk;
        } else {
          if (currentChunk.trim().length > 0) {
            contentChunks.push(currentChunk);
          }
          currentChunk = element;
        }
      }
    }
    if (currentChunk.trim().length > 0) {
      contentChunks.push(currentChunk);
    }

    for (let i = 0; i < contentChunks.length; i++) {
      const chunkTitle = contentChunks.length > 1 ? `${title} (Part ${i + 1})` : title; // Conditionally modify title
      const noteText = `Title: ${chunkTitle}\nLabel: ${label.name}\nContent: ${contentChunks[i]}`;
      console.log("Text to be embedded:", noteText);
      const createEmbedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: noteText,
      });
      const noteEmbedding = createEmbedding.data[0].embedding;
      console.log("Embedding created, proceeding to database transaction");
      const createNote = await prisma.$transaction(async (tx) => {
        const createNote = await tx.note.create({
          data: {
            title: chunkTitle,
            content: contentChunks[i],
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
    }
    return Response.json(
      { message: "Notes created and indexed successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("An error occurred", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    console.log("Request body parsed for PUT");
    const validation = updateNoteSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation failed on PUT", validation.error);
      return Response.json({ error: "Invalid note data" }, { status: 400 });
    }
    const { id, title = "", content = "", labelId = "" } = validation.data; // Provide default empty strings
    const { userId } = auth();
    console.log(`Authenticated user ID on PUT: ${userId}`);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the label name using labelId
    const label = await prisma.label.findUnique({
      where: { id: labelId },
    });
    if (!label) {
      console.error("Label not found on PUT");
      return Response.json({ error: "Label not found" }, { status: 404 });
    }

    // Include the label name in the noteText
    const noteText = `Title: ${title}\nLabel: ${label.name}\nContent: ${content}`;
    console.log("Text to be embedded for PUT:", noteText);
    const createEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: noteText,
    });
    const noteEmbedding = createEmbedding.data[0].embedding;
    console.log("Embedding created, checking for existing note");
    const existingNote = await prisma.note.findUnique({
      where: { id },
    });
    if (!existingNote) {
      console.error("Note not found");
      return Response.json({ error: "Note not found" }, { status: 404 });
    }
    console.log(
      "Existing note found, proceeding to database transaction for PUT"
    );
    const updateNote = await prisma.$transaction(async (tx) => {
      const updateNote = await tx.note.update({
        where: { id },
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
          id: updateNote.id,
          values: noteEmbedding,
          metadata: { userId },
        },
      ]);
      return updateNote;
    });
    console.log("Note updated and indexed successfully");
    return Response.json({ updateNote }, { status: 200 });
  } catch (error) {
    console.error("An error occurred on PUT", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    console.log("Request body parsed for DELETE");
    const validation = deleteNoteSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation failed on DELETE", validation.error);
      return Response.json({ error: "Invalid note data" }, { status: 400 });
    }
    const { id } = validation.data;
    const { userId } = auth();
    console.log(`Authenticated user ID on DELETE: ${userId}`);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("Checking for existing note for DELETE");
    const existingNote = await prisma.note.findUnique({
      where: { id },
    });
    if (!existingNote) {
      console.error("Note not found for DELETE");
      return Response.json({ error: "Note not found" }, { status: 404 });
    }
    console.log(
      "Existing note found, proceeding to database transaction for DELETE"
    );
    const deleteNote = await prisma.$transaction(async (tx) => {
      await tx.note.delete({
        where: { id },
      });
      await notesIndex._deleteOne(id);
    });
    console.log("Note deleted and removed from index successfully");
    return Response.json({ deleteNote }, { status: 200 });
  } catch (error) {
    console.error("An error occurred on DELETE", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
