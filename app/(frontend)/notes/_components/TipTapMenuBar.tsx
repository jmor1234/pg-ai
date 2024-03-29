"use client";

import { Editor } from "@tiptap/react";
import {
  BoldIcon,
  Code,
  Code2Icon,
  Heading1,
  Heading2,
  Heading3,
  ItalicIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react";
import React from "react";

interface TipTapMenuBarProps {
  editor: Editor;
}

const TipTapMenuBar = ({ editor }: TipTapMenuBarProps) => {
  const handleButtonClick = (action: () => void) => (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent the default form submission behavior
    action();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleButtonClick(() => editor.chain().toggleBold().run())}
        disabled={!editor.can().chain().toggleBold().run()}
        className={editor.isActive("bold") ? "is-active" : ""}
      >
        <BoldIcon className="w-6 h-6" />
      </button>
      <button
        onClick={handleButtonClick(() => editor.chain().toggleItalic().run())}
        disabled={!editor.can().chain().toggleItalic().run()}
        className={editor.isActive("italic") ? "is-active" : ""}
      >
        <ItalicIcon className="w-6 h-6" />
      </button>
      <button
        onClick={handleButtonClick(() => editor.chain().focus().toggleStrike().run())}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "is-active" : ""}
      >
        <Strikethrough className="w-6 h-6" />
      </button>
      <button
        onClick={handleButtonClick(() => editor.chain().focus().toggleCode().run())}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={editor.isActive("code") ? "is-active" : ""}
      >
        <Code className="w-6 h-6" />
      </button>
      <button
        onClick={handleButtonClick(() => editor.chain().focus().toggleHeading({ level: 1 }).run())}
        className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
      >
        <Heading1 className="w-6 h-6" />
      </button>
      <button
        onClick={handleButtonClick(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
      >
        <Heading2 className="w-6 h-6" />
      </button>
      <button
        onClick={handleButtonClick(() => editor.chain().focus().toggleHeading({ level: 3 }).run())}
        className={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
      >
        <Heading3 className="w-6 h-6" />
      </button>
      <button
        onClick={handleButtonClick(() => editor.chain().focus().toggleBulletList().run())}
        className={editor.isActive("bulletList") ? "is-active" : ""}
      >
        <List className="w-6 h-6" />
      </button>
      <button
        onClick={handleButtonClick(() => editor.chain().focus().toggleOrderedList().run())}
        className={editor.isActive("orderedList") ? "is-active" : ""}
      >
        <ListOrdered className="w-6 h-6" />
      </button>
      <button
        onClick={handleButtonClick(() => editor.chain().focus().toggleCodeBlock().run())}
        className={editor.isActive("codeBlock") ? "is-active" : ""}
      >
        <Code2Icon className="w-6 h-6" />
      </button>
      <button
        onClick={handleButtonClick(() => editor.chain().focus().toggleBlockquote().run())}
        className={editor.isActive("blockquote") ? "is-active" : ""}
      >
        <Quote className="w-6 h-6" />
      </button>
      <button
        onClick={handleButtonClick(() => editor.chain().focus().undo().run())}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <Undo className="w-6 h-6" />
      </button>
      <button
        onClick={handleButtonClick(() => editor.chain().focus().redo().run())}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <Redo className="w-6 h-6" />
      </button>
    </div>
  );
};

export default TipTapMenuBar;
