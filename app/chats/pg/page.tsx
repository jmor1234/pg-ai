"use client";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "ai/react";
import { ClipLoader } from "react-spinners";
import { Message } from "ai";
import logo from "@/app/favicon.ico"
import Image from "next/image";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-100 max-w-4xl mx-auto">
      <header className="flex justify-center items-center h-20 bg-gradient-to-r from-primary to-secondary rounded-xl shadow-md">
        <div className="flex items-center space-x-2">
          <Image src={logo} alt="Logo" className="h-8 w-8" />
          <h1 className="text-2xl font-bold text-white">Ask Paul Graham</h1>
        </div>
      </header>
      <main className="flex-grow p-6 overflow-y-auto space-y-6">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-3 rounded-xl shadow-md ${
                m.role === "user"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="font-semibold">
                  {m.role === "user" ? "You:" : "AI:"}
                </span>
                {m.role !== "user" && isLoading && (
                  <div className="ml-4">
                    <ClipLoader color="#3B82F6" loading={isLoading} size={20} />
                  </div>
                )}
                <p className="whitespace-pre-line text-base">{m.content}</p>
              </div>
            </div>
          </div>
        ))}
      </main>
      <footer className="flex-shrink-0 p-4 bg-white border-t border-gray-200">
        <form
          onSubmit={handleSubmit}
          className="flex rounded-lg border border-primary bg-white shadow-md"
        >
          <Textarea
            value={input}
            placeholder="Ask Paul Graham"
            onChange={handleInputChange}
            className="flex-grow px-4 py-3 text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 text-white bg-primary rounded-lg hover:bg-secondary focus:outline-none transition duration-300"
          >
            ↑
          </button>
        </form>
      </footer>
    </div>
  );
}