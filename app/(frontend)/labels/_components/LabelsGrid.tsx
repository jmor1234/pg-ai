"use client";

import React from "react";
import { Label, Note } from "@prisma/client";
import LabelCard from "./LabelCard";

interface LabelsGridProps {
    labels: Label[];
}

const LabelsGrid = ({ labels }: LabelsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {labels.map((label, index) => (
        <LabelCard key={index} label={label} />
      ))}
    </div>
  );
};

export default LabelsGrid;
