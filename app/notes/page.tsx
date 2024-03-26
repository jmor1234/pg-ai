import React from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import NoteCard from "./_components/NoteCard";
import prisma from "@/lib/db/prismaSingelton";


const NotesPage = async () => {
  const notes = await prisma.note.findMany() || [];
  const labels = await prisma.label.findMany() || [];

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-center text-2xl font-bold p-1">Notes Home</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
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
