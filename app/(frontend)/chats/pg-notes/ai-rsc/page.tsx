// file: app/chats/pg-notes/ai-rsc/page.tsx

"use client";

import { useState } from "react";
import { ClientMessage } from "@/app/actions";
import { useActions, useUIState } from "ai/rsc";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BotIcon, UserIcon } from "lucide-react";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useUIState();
  const { chatServerAction } = useActions();

  return (
    <div className="flex flex-col max-w-3xl mx-auto p-6 mt-10">
      <header className="bg-gray-900 text-white py-4 px-6 rounded-lg">
        <h1 className="text-xl font-bold text-center">AI/RSC</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {messages.map((message: ClientMessage) => (
            <div
              key={message.id}
              className={`flex items-start ${
                message.role === "user" ? "justify-end" : ""
              }`}
            >
              {message.role === "assistant" && (
                <div className="rounded-full bg-primary/10 w-8 h-8 flex items-center justify-center mr-4">
                  <BotIcon className="h-5 w-5 text-foreground" />
                </div>
              )}
              <div
                className={`rounded-lg p-4 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-foreground"
                }`}
              >
                <p>{message.display}</p>
              </div>
              {message.role === "user" && (
                <div className="rounded-full bg-primary w-8 h-8 flex items-center justify-center ml-4">
                  <UserIcon className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-background py-4 px-6 flex items-center rounded-lg">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setInput("");
            setMessages((messages: ClientMessage[]) => [
              ...messages,
              {
                id: nanoid(),
                role: "user",
                display: input,
              },
            ]);
            const modelResponse = await chatServerAction(input);
            setMessages((messages: ClientMessage[]) => [
              ...messages,
              modelResponse,
            ]);
          }}
          className="flex w-full"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <Button type="submit" variant="default" className="ml-4 bg-primary text-primary-foreground">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

