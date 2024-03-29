"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useCompletion } from "ai/react";
import React, { useEffect, useRef, useState } from "react";
import TipTapMenuBar from "./TipTapMenuBar";
import { Button } from "@/components/ui/button";
import { Note } from "@prisma/client";
import axios from "axios";
import { Text } from "@tiptap/extension-text";
import useEditorDebounce from "@/hooks/editorDebounce";

interface TipTapEditorProps {
  note?: Note;
  onChange: (content: string) => void; // Add an onChange prop
  value?: string; // Add a value prop for initial content
}

const TipTapEditor = ({ note, onChange, value }: TipTapEditorProps) => {
  const [content, setContent] = useState(note?.content || "");

  const { complete: zcomplete, completion: zcompletion } = useCompletion({
    api: `/api/completions/zcompletion`,
  });

  const { complete: xcomplete, completion: xcompletion } = useCompletion({
    api: `/api/completions/xcompletion`,
  });

  const customText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Ctrl-Shift-z": () => {
          const prompt = this.editor.getText();
          console.log(`Current Text for LLM to Z-Complete: ${prompt}`);
          zcomplete(prompt);
          return true;
        },
        "Ctrl-Shift-x": () => {
          const prompt = this.editor.getText();
          console.log(`Current Text for LLM to X-Complete: ${prompt}`);
          xcomplete(prompt);
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: true,
    extensions: [StarterKit, customText],
    content: value || note?.content || "", // Initialize with value or note content
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML()); // Keep internal state update
      onChange(editor.getHTML()); // Call onChange with the new content
    },
  });

  const lastZCompletion = useRef("");
  useEffect(() => {
    if (!zcompletion || !editor) return;
    const newTokens = zcompletion.slice(lastZCompletion.current.length);
    lastZCompletion.current = zcompletion;
    editor.commands.insertContent(newTokens);
  }, [zcompletion, editor]);

  const lastXCompletion = useRef("");
  useEffect(() => {
    if (!xcompletion || !editor) return;
    const newTokens = xcompletion.slice(lastXCompletion.current.length);
    lastXCompletion.current = xcompletion;
    editor.commands.insertContent(newTokens);
  }, [xcompletion, editor]);

  // If the external value changes (e.g., resetting the form), update the editor
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <>
      <div className="flex">
        {editor && <TipTapMenuBar editor={editor} />}
      </div>
      {editor ?
      <div className="prose prose-sm w-full border-2 border-primary/80 rounded-lg p-2 min-h-[300px] text-primary max-w-prose whitespace-pre-line">
      <EditorContent editor={editor} /> 
      </div> 
      
      : <div>Loading editor...</div>}
      <span className="bg-primary/10 text-sm">
        AI Commands: <br />
        <kbd className="border rounded-lg"> Ctrl + Shift + Z </kbd>
        to Z-Complete <br />
        <kbd className="border rounded-lg"> Ctrl + Shift + X </kbd>
        to X-Complete
      </span>
    </>
  );
};

export default TipTapEditor;

