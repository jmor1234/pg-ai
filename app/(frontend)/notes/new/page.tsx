import React from "react";
import NoteForm from "./_components/NoteForm";
import prisma from "@/lib/db/prismaSingelton";
import { Label } from "@prisma/client";
import { Link, NotebookIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const NewNote = async () => {
  const labels: Label[] = await prisma.label.findMany();
  return (
    <div className="h-full p-4 space-y-2 max-w-5xl mx-auto">
      <div className="flex flex-col items-center justify-center space-y-3 m-4">
        <NotebookIcon className="w-8 h-8 mx-auto" />
        <h1 className="text-xl font-semibold tracking-tighter text-primary text-center">
          Create New Note
        </h1>
      </div>
      <NoteForm Labels={labels} />
    </div>
  );
};

export default NewNote;
