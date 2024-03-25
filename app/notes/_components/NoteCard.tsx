"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label, Note } from "@prisma/client";

interface NoteCardProps {
  note: Note;
  label?: Label;
}

const NoteCard = ({ note, label }: NoteCardProps) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{note.title}</CardTitle>
          <h2>{label?.name || 'No Label'}</h2>
        </CardHeader>
        <CardContent>
          <CardDescription className="max-w-prose whitespace-pre-line">
            {note.content}
          </CardDescription>
        </CardContent>
      </Card>
    );
  };

export default NoteCard;
