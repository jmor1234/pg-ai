import React from 'react'
import prisma from '@/lib/db/prismaSingelton';
import Labels from '../notes/_components/Labels';
import LabelsGrid from './_components/LabelsGrid';

const ManageLabels = async () => {
    const labels = await prisma.label.findMany();
  return (
    <div className='"h-full p-4 space-y-2 max-w-5xl mx-auto"'>
      <h1 className='text-xl font-semibold tracking-tighter text-primary text-center'>Manage Labels</h1>
        <LabelsGrid labels={labels} />
    </div>
  )
}

export default ManageLabels