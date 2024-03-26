import React from 'react';
import NoteForm from './_components/NoteForm';
import prisma from '@/lib/db/prismaSingelton';
import { Label } from '@prisma/client';

const NewNote = async () => {
 const labels: Label[] = await prisma.label.findMany();
 return (
    <div>
      <NoteForm Labels={labels} />
    </div>
 );
};

export default NewNote;
