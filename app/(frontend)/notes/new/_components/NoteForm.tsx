"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, FieldValues, Controller} from "react-hook-form";
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

import React, { useState, useRef } from "react";
import { Label, Note } from "@prisma/client";
import { Mic2Icon } from "lucide-react";

interface NoteDialogProps {
  Labels: Label[];
  note?: Note;
}

const NoteForm = ({ Labels, note }: NoteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        console.log("Data available:", event.data.size); // Log the size of the data chunk
        chunksRef.current.push(event.data);
      });

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting audio recording:", error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      console.log("MediaRecorder state before stopping:", mediaRecorderRef.current.state);
      mediaRecorderRef.current.addEventListener('stop', handleAudioUpload, { once: true });
      setTimeout(() => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        console.log("Stopping recording and uploading audio"); // Added for debugging
      }, 1000); // Adjust the delay as needed
    }
  };

  const handleAudioUpload = async () => {
    console.log("Uploading audio file for transcription"); // Existing log
    if (chunksRef.current.length === 0) {
      console.log("No audio data to upload"); // Added for debugging
      return;
    }

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const file = new File([blob], "audio.webm", {
      type: "audio/webm",
      lastModified: Date.now(),
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/notes/transcribe", { // Ensure this endpoint matches your server routing
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Transcription received:", result.text); // Existing log
      form.setValue("content", result.text); // Set the form field value
    } catch (error) {
      console.error("Error in audio transcription:", error); // Existing log
    }
  };

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
                  <Textarea
                    className="sm:min-h-[200px] max-w-prose whitespace-pre-line"
                    placeholder="Input note content"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={isLoading}
            className="w-full bg-secondary text-primary hover:bg-primary hover:text-secondary"
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
          >
            <Mic2Icon className="w-5 h-5 mr-2" />
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
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
