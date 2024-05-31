// file: app/actions.tsx

"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { ReactNode } from "react";
import { z } from "zod";
import { nanoid } from "nanoid";

export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

export async function chatServerAction(input: string): Promise<ClientMessage> {
  "use server";

  const chatHistory = getMutableAIState();

  const modelResponse = await streamUI({
    model: openai("gpt-4o"),
    system: "You are a helpful AI assistant.",
    messages: [
      ...chatHistory.get(),
      {
        role: "user",
        content: input,
      },
    ],
    text: ({ content, done }) => {
      if (done) {
        chatHistory.done((history: ServerMessage[]) => [
          ...history,
          {
            role: "assistant",
            content,
          },
        ]);
      }
      return <div>{content}</div>;
    },
    tools: {},
  });
  return {
    id: nanoid(),
    role: "assistant",
    display: modelResponse.value,
  };
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    chatServerAction,
  },
  initialAIState: [],
  initialUIState: [],
});
