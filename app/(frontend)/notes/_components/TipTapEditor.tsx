"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

import React, { useState } from "react";

const TipTapEditor = () => {
    const [editorState, setEditorState]  = useState("");
  const editor = useEditor({
    autofocus: true,
    extensions: [],
    content: editorState,
    onUpdate: ({ editor }) => {
      setEditorState(editor.getHTML());
    },
  });

  return (
    <div>
        <div>
            <EditorContent editor={editor} />
        </div>
    </div>
  )
};

export default TipTapEditor;
