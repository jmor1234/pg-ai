import React from 'react'
import prisma from '@/lib/db/prismaSingelton';
import Labels from '../notes/_components/Labels';

const ManageLabels = async () => {
    const labels = await prisma.label.findMany();
  return (
    <div className='"h-full p-4 space-y-2 max-w-5xl mx-auto"'>
        <Labels data={labels} />
    </div>
  )
}

export default ManageLabels