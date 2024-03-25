"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { createNoteSchema, CreateNoteType } from "@/lib/validation/note";
import { Label, Note } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";

interface NoteDialogProps {
  noteExist?: Note;
  Labels: Label[];
}

const NoteDialog = ({ noteExist, Labels }: NoteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const form = useForm<CreateNoteType>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: noteExist?.title || "",
      content: noteExist?.content || "",
      labelId: noteExist?.labelId || "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: CreateNoteType) => {
    try {
      if (noteExist) {
        const response = await fetch("/api/notes", {
          method: "PUT",
          body: JSON.stringify({
            ...data,
            id: noteExist.id,
          }),
        });
        if (!response.ok) {
          throw new Error("An error occurred while updating the note");
        }
      } else {
        const response = await fetch("/api/notes", {
          method: "POST",
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(
            "An error occurred while creating the note" + response.status
          );
        }
        form.reset();
      }
      router.refresh();
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating the note");
    }
  };
  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex justify-center mt-4">
          <DialogTrigger className="rounded-lg bg-primary text-secondary hover:bg-secondary hover:text-primary transition font-bold py-2 px-4">
            Create New Note
          </DialogTrigger>
        </div>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
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
                      <Textarea placeholder="Input note content" {...field} />
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
                          <SelectValue placeholder="Select label" defaultValue={field.value} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Labels.map((label) => (
                          <SelectItem value={label.id} key={label.id}>
                            {label.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit">
                Submit
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoteDialog;
