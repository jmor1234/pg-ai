import React from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import NoteDialog from "./_components/NoteDialog";
import NoteCard from "./_components/NoteCard";
import prisma from "@/lib/db/prismaSingelton";


const NotesPage = async () => {
  const notes = await prisma.note.findMany() || [];
  const labels = await prisma.label.findMany() || [];

  return (
    <div className="max-w-5xl mx-auto mt-16 p-4">
      <NoteDialog noteExist={notes[0]} Labels={labels} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {notes.map((note, index) => (
            <NoteCard 
              label={labels.find((label) => label.id === note.labelId) || { id: 'default', name: 'No Label' }} 
              key={index} 
              note={note} 
            />
        ))}
      </div>
    </div>
  );
};

export default NotesPage;
