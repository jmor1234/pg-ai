import React from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";

const Presets = () => {
  const presets = [
    "What's the latest update on the project?",
    "Can you provide a summary of yesterday's meeting?",
    "What are the next steps for our team?",
    "How can I help to move the project forward?",
    "Are there any blockers I should be aware of?",
  ];
  return (
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose a question or conversation starter" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset} value={preset}>
              {preset}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
  );
};

export default Presets;
