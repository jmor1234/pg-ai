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
import DeleteLabel from "./DeleteLabel";

interface LabelCardProps {
  label?: Label;
}

const LabelCard = ({ label }: LabelCardProps) => {
  return (
    <Card className="relative max-h-[250px] overflow-y-auto">
      <div className="flex w-full justify-center items-center p-2 gap-2">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/labels/edit/${label?.id}`}>
            <PencilIcon className="w-4 h-4" />
          </Link>
        </Button>
        <DeleteLabel label={label} />
      </div>
      <CardHeader className="">
        <CardTitle className="text-center">{label?.name}</CardTitle>
      </CardHeader>
    </Card>
  );
};

export default LabelCard;
