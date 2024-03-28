import React from "react";
import prisma from "@/lib/db/prismaSingelton";
import { Label } from "@prisma/client";
import LabelForm from "../_components/LabelForm";
import { TagIcon } from "lucide-react";

const NewLabel = async () => {
  return (
    <div className="flex flex-col items-center justify-center p-2 mt-10">
      <div className="flex flex-col items-center justify-center gap-1">
        <TagIcon className="h-10 w-10 text-primary" />
        <h1 className="text-2xl font-bold">New Label</h1>
      </div>
      <LabelForm />
    </div>
  );
};

export default NewLabel;
