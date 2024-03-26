import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label, Note } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2 } from "lucide-react";
import DeleteNote from "./DeleteNote";

interface NoteCardProps {
  note: Note;
  label?: Label;
}

const NoteCard = ({ note, label }: NoteCardProps) => {
  return (
    <Card className="relative max-h-[250px] overflow-y-auto">
      <div className="flex w-full justify-center items-center p-2 gap-2">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/notes/edit/${note.id}`}>
            <PencilIcon className="w-4 h-4" />
          </Link>
        </Button>
        <DeleteNote note={note} />
      </div>
      <CardHeader className="">
        <CardTitle className="text-center">{note.title}</CardTitle>
        <h2 className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-center text-sm">
          {label?.name || "No Label"}
        </h2>
      </CardHeader>
      <CardContent className="p-2">
        <CardDescription className="max-w-prose whitespace-pre-line text-center">
          {note.content}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default NoteCard;
