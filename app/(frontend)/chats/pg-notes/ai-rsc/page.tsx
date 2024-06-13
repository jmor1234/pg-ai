// file: app/chats/pg-notes/ai-rsc/page.tsx

"use client";

import { useState } from "react";
import { ClientMessage } from "@/app/actions";
import { useActions, useUIState } from "ai/rsc";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BotIcon, UserIcon } from "lucide-react";
import { SaveChatType } from "@/lib/validation/chatHistory";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useUIState();
  const { chatServerAction } = useActions();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleConversationDistillation = async () => {
    setIsSaving(true); // Set loading state before the request
    const currentConversation = messages
      .map((msg: ClientMessage) => `${msg.role}: ${msg.display}`)
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
          <Button
            type="submit"
            variant="default"
            className="ml-4 bg-primary text-primary-foreground"
          >
            Send
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
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </form>
      </div>
    </div>
  );
}
