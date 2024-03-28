"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@prisma/client";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface DeleteLabelProps {
  label?: Label;
}

const DeleteLabel = ({ label }: DeleteLabelProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  async function onDelete() {
    if (!label) return;
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this label?"
    );
    if (!isConfirmed) return; // Stop the deletion process if user cancels
    setIsLoading(true); // Set loading to true at the start of deletion
    try {
      const response = await fetch("/api/labels", {
        method: "DELETE",
        headers: {
          // It's a good practice to include headers
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: label.id,
        }),
      });
      if (!response.ok) {
        throw new Error("Something went wrong" + response.status);
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Issue deleting note, please try again.");
    } finally {
      setIsLoading(false); // Reset loading state regardless of outcome
    }
  }

  return (
    <div className="flex w-full">
      <Button
        onClick={onDelete}
        variant="destructive"
        size="sm"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? <span>Loading...</span> : <Trash2 className="w-4 h-4" />}
      </Button>
    </div>
  );
};

export default DeleteLabel;
