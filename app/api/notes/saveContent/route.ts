import prisma from "@/lib/db/prismaSingelton";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { noteId, content } = body;
    if (!noteId || !content) {
      return Response.json({ error: "Invalid note" }, { status: 400 });
    }
    const findNote = await prisma.note.findUnique({
      where: { id: noteId },
    });
    if (!findNote) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }
    if (findNote.content !== content) {
      await prisma.note.update({
        where: { id: noteId },
        data: { content },
      });
    }
    return Response.json({ message: "Note updated" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
