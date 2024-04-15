// app/(frontend)/chats/pg-notes/page.tsx

"use client";

import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { Bot, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Message } from "ai";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useRef, useState } from "react"; // Add useState to the import
// Import the AudioRecorder component
import AudioRecorder from "@/components/whisperaudio";
import { Textarea } from "@/components/ui/textarea";
import { SaveChatType } from "@/lib/validation/chatHistory";
import { useToast } from "@/components/ui/use-toast";
import Presets from "./_components/presets";

export default function NotesChatBox() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false); // Add this line to manage the saving state
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
    error,
  } = useChat({
    api: `/api/chat/pg-notes`,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const lastMessageIsUser = messages[messages.length - 1]?.role === "user";

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      const lastMessageElement = scrollElement.lastChild;
      if (lastMessageElement) {
        // Introduce a delay before scrolling
        setTimeout(() => {
          // Ensure smooth scrolling by custom implementation
          const scrollToBottom = () => {
            const maxScrollTop = scrollElement.scrollHeight - scrollElement.clientHeight;
            if (scrollElement.scrollTop < maxScrollTop) {
              scrollElement.scrollTop += 5; // Adjust the increment value as needed for smoother scrolling
              requestAnimationFrame(scrollToBottom);
            }
          };
          scrollToBottom();
        }, 5000); // Delay in milliseconds, adjust as needed
      }
    }
  }, [messages]);

  const handleTranscriptionComplete = (transcription: string) => {
    const updatedInput = `${input} ${transcription}`.trim();
    const syntheticEvent = {
      target: { value: updatedInput },
    } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
    handleInputChange(syntheticEvent);
  };

  const handleSaveChat = async () => {
    setIsSaving(true); // Start loading
    const currentConversation = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n\n");
    const chatData: SaveChatType = {
      title: `Chat on ${new Date().toLocaleString("en-US", {
        year: "numeric", // Add year
        month: "2-digit", // Add month
        day: "2-digit", // Add day
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`,
      content: currentConversation,
      label: "Chat History",
    };

    const response = await fetch("/api/notes/chatHistory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chatData),
    });

    if (response.ok) {
      console.log("Chat saved to notes successfully.");
      toast({
        title: "Chat Saved",
        description:
          "Your chat has been saved to your notes under the label Chat History.",
      });
    } else {
      console.error("Failed to save chat to notes.");
    }
    setIsSaving(false); // End loading
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col mt-16 py-10 border px-4 rounded-xl shadow-xl">
      <h1 className="text-2xl font-bold text-center text-muted-foreground mb-4">
        Contextual PG
      </h1>
      <div className="mx-auto max-w-3xl overflow-y-auto" ref={scrollRef}>
        {messages.map((message) => (
          <ChatMessage message={message} key={message.id} />
        ))}
        {isLoading && lastMessageIsUser && (
          <ChatMessage
            message={{
              role: "assistant",
              content: "Finding the most relevant data to bring into the conversation...",
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
        <textarea
          className="max-w-prose whitespace-pre-wrap rounded-xl border px-3 py-2 text-sm shadow-md flex-grow"
          placeholder="Interact with PG insights"
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
        <Button className="" type="submit" size="sm">
          Send
        </Button>
      </form>
      <div className=" my-1 max-w-[150px] sm:max-w-[200px] w-full mx-auto mt-2">
        <div className="flex items-center justify-center md:gap-3 sm:gap-2">
          <AudioRecorder
            onTranscriptionComplete={handleTranscriptionComplete}
          />
          <Button
            title="Clear Chat"
            type="button"
            size="sm"
            variant="destructive"
            className="opacity-70 hover:opacity-100"
            onClick={() => setMessages([])}
          >
            Clear Chat
          </Button>
          <Button
            title="Save Chat to Notes"
            variant="outline"
            type="button"
            size="sm"
            className=""
            onClick={handleSaveChat}
            disabled={isSaving} // Disable the button when isSaving is true
          >
            {isSaving ? "Saving..." : "Save Chat"}
          </Button>
        </div>
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

