import React from "react";
import prisma from "@/lib/db/prismaSingelton";
import Labels from "../notes/_components/Labels";
import LabelsGrid from "./_components/LabelsGrid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon, TagIcon } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

const ManageLabels = async () => {
  const { userId } = auth();
  if (!userId) {
    return null;
  }
  const labels = await prisma.label.findMany();
  return (
    <div className='"h-full p-4 space-y-2 max-w-5xl mx-auto"'>
      <div className="flex flex-col items-center justify-center space-y-3">
        <TagIcon className="w-8 h-8 mx-auto" />
        <h1 className="text-xl font-semibold tracking-tighter text-primary text-center">
          Manage Labels
        </h1>
        <Button size="sm" asChild className="">
          <Link href="/labels/new">
            <PlusIcon className="w-4 h-4 mr-1" />
            Create New Label
          </Link>
        </Button>
      </div>
      <LabelsGrid labels={labels} />
    </div>
  );
};

export default ManageLabels;
