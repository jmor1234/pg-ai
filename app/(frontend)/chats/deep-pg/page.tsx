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
import AudioRecorder from "@/components/whisperaudio";

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
    api: `/api/chat/deep-pg`,
  });

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

  const handleTranscriptionComplete = (transcription: string) => {
    const updatedInput = `${input} ${transcription}`.trim();
    const syntheticEvent = {
      target: { value: updatedInput },
    } as unknown as React.ChangeEvent<HTMLTextAreaElement>; // Adjust the casting here
    handleInputChange(syntheticEvent);
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col mt-16 py-10 border px-4 rounded-xl shadow-xl">
      <h1 className="text-2xl font-bold text-center text-muted-foreground">
        Deep Writing with PG
      </h1>
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
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex items-center justify-center gap-2"
      >
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
        <textarea
          className="max-w-prose whitespace-pre-wrap rounded-xl border px-3 py-2 text-sm shadow-md flex-grow"
          placeholder="Interact with your notes..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault(); // Prevents the default action of the Enter key
              // Create a synthetic event object
              const syntheticEvent = {
                preventDefault: () => {}, // Mock preventDefault method
                stopPropagation: () => {}, // Mock stopPropagation method
              } as React.FormEvent<HTMLFormElement>;
              handleSubmit(syntheticEvent); // Pass the synthetic event to handleSubmit
            }
          }}
        />

        <Button className="" type="submit">
          Send
        </Button>
      </form>
      <div className=" my-1 max-w-[150px] sm:max-w-[200px] w-full mx-auto">
        <AudioRecorder onTranscriptionComplete={handleTranscriptionComplete} />
      </div>
    </div>
  );
}

function ChatMessage({
  message: { role, content },
}: {
  message: Pick<Message, "role" | "content">;
}) {
  const { user } = useUser();
  const isAiMessage = role === "assistant";
  return (
    <div
      className={cn(
        "mb-3 flex items-center",
        isAiMessage ? "me-5 justify-start" : "ms-5 justify-end"
      )}
    >
      {isAiMessage && <Bot className="mr-2 shrink-0" size={20} />}
      <p
        className={cn(
          "whitespace-pre-line max-w-prose rounded-xl border px-3 py-2 text-sm shadow-md",
          isAiMessage ? "bg-primary/10" : "bg-primary text-primary-foreground"
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
