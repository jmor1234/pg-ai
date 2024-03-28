// app/notes/edit/[id]/page.server.tsx
import React from 'react';
import prisma from '@/lib/db/prismaSingelton';
import { Label } from '@prisma/client';
import LabelForm from '../../_components/LabelForm';

interface EditNoteProps {
  params: {
    id: string;
  }
}

const EditLabelPage = async ({ params }: EditNoteProps) => {
  const label = await prisma.label.findUnique({ where: { id: params.id } });

  return (
    <div className='flex flex-col items-center p-4'>
      <h1 className='text-2xl font-bold'>Edit Label</h1>
      <LabelForm label={label ?? undefined} />
    </div>
  )
}

export default EditLabelPage
