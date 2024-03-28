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
import { createLabelSchema, CreateLabelType } from "@/lib/validation/label";

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

interface LabelFormProps {
  label?: Label;
}

const LabelForm = ({ label }: LabelFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const form = useForm<CreateLabelType>({
    resolver: zodResolver(createLabelSchema),
    defaultValues: {
      name: label?.name || "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: CreateLabelType) => {
    try {
      if (label) {
        const response = await fetch(`/api/labels`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, id: label.id }),
        });
        if (!response.ok) {
          throw new Error(
            "An error occurred while updating the note. Status: " +
              response.status
          );
        }
        router.push("/labels");
      } else {
        const response = await fetch("/api/labels", {
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
        router.push("/labels");
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Label Name" {...field} />
                </FormControl>
                <FormMessage />
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

export default LabelForm;
