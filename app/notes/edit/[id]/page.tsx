// app/notes/edit/[id]/page.server.tsx
import React from 'react';
import prisma from '@/lib/db/prismaSingelton';
import { Label } from '@prisma/client';
import NoteForm from '../../new/_components/NoteForm';

interface EditNoteProps {
  params: {
    id: string;
  }
}

const EditNotePage = async ({ params }: EditNoteProps) => {
  const note = await prisma.note.findUnique({ where: { id: params.id } });
  const labels = await prisma.label.findMany();

  return (
    <div>
      <NoteForm Labels={labels} note={note ?? undefined} />
    </div>
  )
}

export default EditNotePage
