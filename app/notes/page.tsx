import React from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import NoteDialog from "./_components/NoteDialog";
import NoteCard from "./_components/NoteCard";

const NotesPage = () => {
    const notes = [
        { title: "Note 1", description: "This is the first note" },
        { title: "Note 2", description: "This is the second note" },
        { title: "Note 3", description: "This is the third note" },
        // Add more notes as needed
      ];

  return (
    <div className="max-w-5xl mx-auto mt-16 p-4">
      <NoteDialog />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {notes.map((note, index) => (
            <NoteCard key={index} note={note} />
        ))}
      </div>
    </div>
  );
};

export default NotesPage;
