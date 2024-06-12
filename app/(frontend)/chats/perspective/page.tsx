//app/(frontend)/chats/perspective/page.tsx

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
    api: `/api/chat/perspective`,
  });

  const [dropdownValue, setDropdownValue] = useState("default");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const kickStarters = [
    "What makes the opportunities in the software and tech industry so amazing?",
    "Whose perspective has significantly shaped the author's view on leverage in the software industry?",
    "What are the traditional forms of leverage discussed by Naval Ravikant?",
    "What new forms of leverage have been enabled by the internet's scale?",
    "How do media and code allow for leveraging time, skill, and creativity?",
    "What is the key difference between distributing software and physical products to the masses?",
    "What is the main issue with traditional forms of leverage, such as capital?",
    "Why is hiring employees considered costly and time-consuming?",
    "What is the unique advantage of software compared to media in terms of monetization?",
    "What are the minimum requirements or life circumstances necessary to capitalize on the opportunity of getting rich in the software industry?",
    "Why is having time for focused effort crucial when learning to code?",
    "What are some common obstacles that prevent someone from having the time needed to learn to code?",
    "Why is a willingness to sacrifice short-term income for long-term skill-building important in becoming a rich software engineer or entrepreneur?",
    "How have large language models (LLMs) fundamentally changed the modern software engineering landscape?",
    "What benefits do LLMs provide to software engineers in terms of learning and building efficiency?",
    "Why does the rise of LLMs present a unique opportunity for new software engineers?",
    "What new aspects must developers consider when building AI-native applications?",
    "How does the rapid evolution of the software industry, driven by LLMs, level the playing field for new engineers?",
    "What is the new core skill set for a software engineer and entrepreneur in the era of LLMs?",
    "How can software itself be a product that can be monetized into a business?",
    "What platforms are the best places to showcase software and find users or employers?",
    "How can showcasing software skills publicly lead to job opportunities at top software and AI companies?",
    "What is the typical salary range for jobs at the best software or AI companies?",
    "What working arrangements do many modern, progressive software companies offer?",
    "How does the nature of software engineering allow for skills to be demonstrated through the 'proof in the pudding'?",
    "What are the two main ways to monetize software skills?",
    "Why does software offer a unique opportunity that no other industry can match?",
    "How has the fundamental shift of LLMs going mainstream affected the learning and building of software?",
    "What does the public showcase of software enable in terms of monetization and job opportunities?",
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

    const response = await fetch("/api/notes/memory", {
      // Updated endpoint
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
        Ask about the Core Perspective
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
            Perspective Questions
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
          <Button
            className="bg-primary text-primary-foreground"
            type="submit"
            size="sm"
          >
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
          isAiMessage
            ? "bg-primary/10 text-foreground"
            : "bg-primary text-primary-foreground"
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
