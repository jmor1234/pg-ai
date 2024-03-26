"use client";

import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { Bot, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Message } from "ai";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function NotesChatBox() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
    error,
  } = useChat({
    api: `/api/`
  }
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  const lastMessageIsUser = messages[messages.length - 1]?.role === "user";

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      const lastMessageElement = scrollElement.lastChild;
      if (lastMessageElement) {
        (lastMessageElement as HTMLElement).scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  }, [messages]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col mt-16 py-10 border px-4 rounded-xl shadow-xl">
      <h1 className="text-2xl font-bold text-center text-muted-foreground">Chat With Your Notes</h1>
      <div className="mx-auto max-w-3xl" ref={scrollRef}>
        {messages.map((message) => (
          <ChatMessage message={message} key={message.id} />
        ))}
        {isLoading && lastMessageIsUser && (
          <ChatMessage
            message={{
              role: "assistant",
              content: "Thinking...",
            }}
          />
        )}
        {error && (
          <ChatMessage
            message={{
              role: "assistant",
              content: "There was an issue, please try again.",
            }}
          />
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Button
          title="Clear Chat"
          variant="outline"
          size="icon"
          className="shrink-0"
          type="button"
          onClick={() => setMessages([])}
        >
          <Trash />
        </Button>
        <Input
          placeholder="Interact with your notes..."
          value={input}
          onChange={handleInputChange}
        />
        <Button className="bg-black" type="submit">
          Send
        </Button>
      </form>
    </div>
  );
}

function ChatMessage({
  message: { role, content }
}: {
  message: Pick<Message, "role" | "content">;
}) {
  const { user } = useUser();
  const isAiMessage = role === "assistant";
  return (
    <div
      className={cn(
        "mb-3 flex items-center",
        isAiMessage ? "me-5 justify-start" : "ms-5 justify-end",
      )}
    > 
      {isAiMessage && <Bot className="mr-2 shrink-0" size={20} />}
      <p
        className={cn(
          "whitespace-pre-line rounded-xl border px-3 py-2 text-sm shadow-md",
          isAiMessage ? "bg-gray-100" : "bg-primary text-primary-foreground",
        )}
      >
        {content}
      </p>
      {!isAiMessage && user?.imageUrl && (
        <Image
          src={user.imageUrl}
          alt="User Image"
          width={40}
          height={40}
          className="ml-2 rounded-full"
        />
      )}
    </div>
  );
}