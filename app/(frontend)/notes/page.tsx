import React from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import NoteCard from "./_components/NoteCard";
import prisma from "@/lib/db/prismaSingelton";
import SearchInput from "./_components/SearchInput";
import Labels from "./_components/Labels";
import NotesGrid from "./_components/NotesGrid";
import { PlusIcon } from "lucide-react";
import { auth, currentUser } from "@clerk/nextjs/server";

interface NotesPageProps {
  searchParams: {
    labelId?: string;
    title?: string;
  };
}

const NotesPage = async ({ searchParams }: NotesPageProps) => {
  const { userId } = auth();
  if (!userId) {
    return null;
  }
  const data = await prisma.note.findMany({
    where: {
      userId,
      labelId: searchParams.labelId,
      title: {
        search: searchParams.title,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const labels = await prisma.label.findMany();

  return (
    <div className="h-full p-4 space-y-2 max-w-5xl mx-auto">
      <SearchInput />
      <Labels data={labels} />
      <NotesGrid notes={data} labels={labels} />
    </div>
  );
};

export default NotesPage;
