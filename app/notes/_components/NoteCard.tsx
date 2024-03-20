"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface Note {
  title: string;
  description: string;
}

const NoteCard = ({ note }: { note: Note }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{note.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{note.description}</CardDescription>
        </CardContent>
      </Card>
    );
  };

export default NoteCard;
