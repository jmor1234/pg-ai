//app/(frontend)/chats/pg-notes/page.tsx

"use client";

import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { ArrowUp, ArrowUpNarrowWide, Bot, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Message } from "ai";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import AudioRecorder from "@/components/whisperaudio";
import { Textarea } from "@/components/ui/textarea";
import { SaveChatType } from "@/lib/validation/chatHistory";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function NotesChatBox() {
  const { toast } = useToast();
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

  const [dropdownValue, setDropdownValue] = useState("default");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const kickStarters = [
    "Is the struggle of building a startup worth it?",
    "How is the way tech founders become wealthy fundamentally different?",
    "Why might joining a startup early be better than founding one?",
    "Is burning the midnight oil actually smart?",
    "What role does age play in being successful in the tech industry?",
    "Talk to me about failure",
    "Can one successfully balance being a founder and parent?",
    "prioritize financial freedom or curiosities and passions?",
    "Do I need to be mean to be an effective leader like Steve Jobs was?",
    "Can non-technical founders achieve the same wealth as technical ones?",
    "Talk to me about hiring and firing within a startup",
    "Why would a smart, capable person choose to work for me?",
    "Based on what you know about me thus far, what should we discuss?",
    "What additional context should I provide for the most relevant insights?",
    "Why are the first few users the most difficult AND most important simultaneously?",
    "Why would any investor want to give me money?",
    "Is my startup idea just a glorified hobby, or a legitimate business opportunity?",
    "Niche vs broad problem-solving when starting a company",
    "Should I be worried about others copying me?",
    "Why is curiosity so important?",
    "What is really the key to building something valuable long term?",
  ];

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedInput = `${input} ${event.target.value}`.trim();
    const syntheticEvent = {
      target: { value: updatedInput },
    } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
    handleInputChange(syntheticEvent);
    setDropdownValue("default"); // Reset dropdown after selection
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  const lastMessageIsUser = messages[messages.length - 1]?.role === "user";

  const handleTranscriptionComplete = (transcription: string) => {
    const updatedInput = `${input} ${transcription}`.trim();
    const syntheticEvent = {
      target: { value: updatedInput },
    } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
    handleInputChange(syntheticEvent);
  };

  const handleConversationDistillation = async () => {
    setIsSaving(true); // Set loading state before the request
    const currentConversation = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n\n");
    const chatData: SaveChatType = {
      title: `Chat on ${new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`,
      content: currentConversation,
      label: "Chat History",
    };

    const response = await fetch("/api/notes/memory", {  // Updated endpoint
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
      const errorData = await response.json(); // Parse error message
      console.error("Failed to save chat to notes:", errorData.error);
      toast({
        title: "Error Saving Chat",
        description: errorData.error || "An unexpected error occurred.",
      });
    }
    router.refresh();
    setIsSaving(false); // Reset loading state after the request
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col mt-16 py-10 border px-4 rounded-xl shadow-xl bg-background">
      <h1 className="text-2xl font-bold text-center text-foreground mb-4">
        Interact with PG-Insights
      </h1>
      <div className="mx-auto max-w-3xl overflow-y-auto" ref={scrollRef}>
        {messages.map((message) => (
          <ChatMessage message={message} key={message.id} />
        ))}
        {isLoading && lastMessageIsUser && (
          <ChatMessage
            message={{
              role: "assistant",
              content:
                "Finding the relevant data to bring into the conversation...",
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
        className="mt-6 flex flex-col items-center justify-center gap-4"
      >
        <select
          className="rounded-lg text-sm text-muted-foreground py-2 px-4 w-full max-w-md border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={handleSelectChange}
          value={dropdownValue}
        >
          <option value="default" className="">
            Common Questions & Conversation Starters
          </option>
          {kickStarters.map((prompt, index) => (
            <option
              className=""
              key={index}
              value={prompt}
              style={{ whiteSpace: "normal", wordBreak: "break-word" }}
            >
              {prompt}
            </option>
          ))}
        </select>
        <div className="flex items-center justify-center gap-2 w-full">
          <textarea
            className="max-w-prose whitespace-pre-wrap rounded-xl border px-4 py-2 text-sm shadow-md flex-grow focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="What are you curious about at the moment?"
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
          <Button className="bg-primary text-primary-foreground" type="submit" size="sm">
            Send
          </Button>
        </div>
      </form>
      <div className="mt-4 max-w-md w-full mx-auto">
        <div className="flex items-center justify-center gap-4">
          <AudioRecorder
            onTranscriptionComplete={handleTranscriptionComplete}
          />
          <Button
            title="Clear Chat"
            type="button"
            size="sm"
            variant="outline"
            className="text-muted-foreground border-border hover:bg-muted"
            onClick={() => setMessages([])}
          >
            Clear Chat
          </Button>
          <Button
            title="Save Chat to Notes"
            variant="outline"
            type="button"
            size="sm"
            className="text-primary border-primary hover:bg-primary/10"
            onClick={handleConversationDistillation}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save This Interaction"}
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
        "mb-4 flex items-start",
        isAiMessage ? "justify-start" : "justify-end"
      )}
    >
      {isAiMessage && <Bot className="mr-2 shrink-0 text-primary" size={24} />}
      <div
        className={cn(
          "whitespace-pre-line max-w-prose rounded-xl border px-4 py-2 text-sm shadow-md",
          isAiMessage ? "bg-primary/10 text-foreground" : "bg-primary text-primary-foreground"
        )}
      >
        {content}
      </div>
      {!isAiMessage && user?.imageUrl && (
        <Image
          src={user.imageUrl}
          alt="User Image"
          width={32}
          height={32}
          className="ml-2 rounded-full"
        />
      )}
    </div>
  );
}
