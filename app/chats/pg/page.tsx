"use client";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "ai/react";
import { ClipLoader } from "react-spinners";
import { Message } from "ai";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-100 max-w-4xl mx-auto">
      <div className="flex justify-center items-center h-16 bg-white border-b border-gray-200 rounded-xl">
        <div className="text-xl font-semibold text-primary">
          Ask Paul Graham
        </div>
      </div>
      <div className="flex-grow p-6 overflow-y-auto space-y-6">
        {messages.map((m) => {
          const isUserMessage = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg shadow ${
                  isUserMessage ? "bg-primary text-white" : "bg-white text-gray-800"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {isUserMessage ? (
                    <span className="font-bold text-secondary">You:</span>
                  ) : (
                    <>
                      <span className="font-bold text-primary">AI:</span>
                      {!isUserMessage && isLoading && (
                        <div className="ml-4">
                          <ClipLoader color="#000" loading={isLoading} size={20} />
                        </div>
                      )}
                    </>
                  )}
                  <p className="whitespace-pre-line text-sm">{m.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 p-4 bg-white border-t border-gray-200"
      >
        <div className="flex rounded-lg border border-gray-300 bg-white">
          <Textarea
            value={input}
            placeholder="Ask Paul Graham"
            onChange={handleInputChange}
            className="flex-grow px-4 py-2 text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 text-secondary bg-primary rounded-lg hover:bg-secondary hover:text-primary  focus:outline-none"
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  );
}
