import {
  createLabelSchema,
  updateLabelSchema,
  deleteLabelSchema,
} from "@/lib/validation/label";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prismaSingelton";
import { metadata } from "@/app/layout";

export async function POST(req: Request) {
  try {
    console.log("Starting POST request processing");
    const body = await req.json();
    console.log("Request body parsed");
    const validation = createLabelSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation failed", validation.error);
      return Response.json({ error: "Invalid label" }, { status: 400 });
    }
    const { name } = validation.data;
    const { userId } = auth();
    console.log(`Authenticated user ID: ${userId}`);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const createLabel = await prisma.label.create({
      data: {
        name,
      },
    });
    return Response.json({ createLabel }, { status: 201 });
  } catch (error) {
    console.error("An error occurred", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    console.log("Request body parsed for PUT");
    const validation = updateLabelSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation failed on PUT", validation.error);
      return Response.json({ error: "Invalid label data" }, { status: 400 });
    }
    const { id, name } = validation.data;
    const { userId } = auth();
    console.log(`Authenticated user ID on PUT: ${userId}`);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const existingLabel = await prisma.label.findUnique({
      where: { id },
    });
    if (!existingLabel) {
      console.error("Label not found");
      return Response.json({ error: "Label not found" }, { status: 404 });
    }
    console.log(
      "Existing note found, proceeding to database transaction for PUT"
    );
    const updateLabel = await prisma.label.update({
      where: { id },
      data: {
        name,
      },
    });
    console.log("Label updated and indexed successfully");
    return Response.json({ updateLabel }, { status: 200 });
  } catch (error) {
    console.error("An error occurred on PUT", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    console.log("Request body parsed for DELETE");
    const validation = deleteLabelSchema.safeParse(body);
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
    console.log("Checking for existing label for DELETE");
    const existingLabel = await prisma.label.findUnique({
      where: { id },
    });
    if (!existingLabel) {
      console.error("Label not found for DELETE");
      return Response.json({ error: "Label not found" }, { status: 404 });
    }
    console.log(
      "Existing note found, proceeding to database transaction for DELETE"
    );
    const deleteLabel = await prisma.label.delete({
      where: { id },
    });
    console.log("Label deleted and removed from index successfully");
    return Response.json({ deleteLabel }, { status: 200 });
  } catch (error) {
    console.error("An error occurred on DELETE", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
