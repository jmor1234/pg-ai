"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, FieldValues } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { createNoteSchema, CreateNoteType } from "@/lib/validation/note";

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import React, { useState } from "react";
import { Label, Note } from "@prisma/client";
import TipTapEditor from "../../_components/TipTapEditor";

interface NoteDialogProps {
  Labels: Label[];
  note?: Note;
}

const NoteForm = ({ Labels, note }: NoteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const form = useForm<CreateNoteType>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: note?.title || "",
      content: note?.content || "",
      labelId: note?.labelId || "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: CreateNoteType) => {
    try {
      if (note) {
        const response = await fetch(`/api/notes`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, id: note.id }),
        });
        if (!response.ok) {
          throw new Error(
            "An error occurred while updating the note. Status: " +
              response.status
          );
        }
        router.push("/notes");
      } else {
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(
            "An error occurred while creating the note. Status: " +
              response.status
          );
        }
        form.reset();
        router.push("/notes");
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating the note. Please try again.");
    }
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto mt-10 pb-10 border border-gray-400 rounded-xl p-8 shadow-xl">
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Input note title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <TipTapEditor note={note} onChange={field.onChange} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="labelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select label"
                        defaultValue={field.value}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Labels.map((label) => (
                      <SelectItem
                        value={label.id}
                        key={label.id}
                        className="cursor-pointer"
                      >
                        {label.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <Button disabled={isLoading} className="w-full" type="submit">
            {isLoading ? "Loading..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default NoteForm;
