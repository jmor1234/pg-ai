"use client";

import React from "react";
import NoteCard from "./NoteCard";
import { Label, Note } from "@prisma/client";

interface NoteGridProps {
    notes: Note[] ;
    labels: Label[];
}

const NotesGrid = ({ notes, labels }: NoteGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {notes.map((note, index) => (
        <NoteCard
          label={
            labels.find((label) => label.id === note.labelId) || {
              id: "default",
              name: "No Label",
            }
          }
          key={index}
          note={note}
        />
      ))}
    </div>
  );
};

export default NotesGrid;
