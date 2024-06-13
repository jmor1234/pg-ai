// file: app/actions.tsx

"use server";

import prisma from "@/lib/db/prismaSingelton";
import { anthropic } from "@ai-sdk/anthropic";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { nanoid } from "nanoid";
import { OpenAI } from "openai";
import { ReactNode } from "react";
import { generateText } from "ai";
import { z } from "zod";
import Markdown from "react-markdown";

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

  //retrieve user-specific context
  const { userId } = auth();
  const user = await currentUser();
  const firstName = user?.firstName || "User has not provided their name yet.";

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  const notesIndex = pc.Index("notes-gpt");

  const recentMessages = chatHistory.get().slice(-10);
  const recentMessagesEmbedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: recentMessages
      .map((message: { role: string; content: string }) => {
        return message.role + ": " + message.content + "\n";
      })
      .join("\n"),
  });

  const embedding = recentMessagesEmbedding.data[0].embedding;

  const queryMemoryIndex = await notesIndex.query({
    topK: 5,
    vector: embedding,
    filter: {
      userId: userId,
    },
  });

  const contextualMemory = await prisma.note.findMany({
    where: {
      id: { in: queryMemoryIndex.matches.map((match) => match.id) },
    },
    include: {
      label: true,
    },
  });

  const currentDate = new Date().toLocaleDateString("en-US");
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const coreSystemMessage = `
  <role>

  <role>

  <userContext>
  The current date is ${currentDate} and the time is ${currentTime}.
  The user's first name is ${firstName}.

  ${contextualMemory
    .map(
      (memory) => `
  Date Of Information: ${memory.title}
  Information about the user from previous conversations: ${memory.content}
  `
    )
    .join("\n\n")}
  </userContext>


  <instructions>

  </instructions>
  `;

  const coreResponse = await streamUI({
    model: anthropic("claude-3-sonnet-20240229"),
    system: coreSystemMessage,
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
      return (
        <Markdown
          components={{
            p: ({ children }) => <p className="py-2">{children}</p>,
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold my-4">{children}</h1>
            ),
          }}
        >
          {content}
        </Markdown>
      );
    },
    tools: {
      retrieveRelevantPaulGrahamEssaySnippets: {
        description: `
        Use this tool if the user delibrately asks about insights from Paul Graham or if you deem that the current conversation would benefit from retrieving relevant insights from Paul Graham.
        This tool will take the current conversation between you and the user and retrieve the most relevant snippets from across all of Paul Graham's essays, that will enable you to provide contextually relevant insights to the user using Paul Graham's essays.
        `,
        parameters: z.object({
          conversation: z.array(
            z
              .object({
                role: z.enum(["user", "assistant"]),
                content: z.string(),
              })
              .describe(
                "This is the entire array of messages from the user and assistant from the conversation so far."
              )
          ),
        }),
        generate: async function* ({ conversation }) {
          yield (
            <div className="animate-pulse p-4 bg-neutral-50 rounded-md">
              Finding the most relevant information from across all of Paul
              Graham&apos;s essays...
            </div>
          );
          const paulGrahamEssayChunksIndex = pc.Index("pg-chunks");
          const pgIndexResponse = await paulGrahamEssayChunksIndex.query({
            topK: 5,
            vector: embedding,
            includeMetadata: true,
          });
          const essayChunks = pgIndexResponse.matches.map((snippet) => {
            if (snippet.metadata) {
              return {
                EssayTitle: snippet.metadata.esssay_title,
                EssayUrl: snippet.metadata.esssay_url,
                EssaySnippetContent: snippet.metadata.content,
              };
            } else {
              return {
                EssayTitle: "Unknown Title",
                EssayUrl: "#",
                EssaySnippetContent: "No content available",
              };
            }
          });
          const formattedRelevantEssayChunks = essayChunks
            .map(
              (chunk) => `
          Title: ${chunk.EssayTitle}
          URL: ${chunk.EssayUrl}
          Content: ${chunk.EssaySnippetContent}`
            )
            .join("\n\n");
          yield (
            <div className="p-4 bg-neutral-50 rounded-md">
              {formattedRelevantEssayChunks}
            </div>
          );
          await new Promise((resolve) => setTimeout(resolve, 5000));

          yield (
            <div className="p-4 bg-neutral-50 rounded-md">
              Generating insights from the relevant essay chunks...
            </div>
          );

          const paulGrahamToolSystemMessage = `
          The user is asking about insights from Paul Graham.
          The user's question is: ${input}
          The relevant essay chunks are: ${formattedRelevantEssayChunks}
          `;
          console.log(
            `paulGrahamToolSystemMessage: ${paulGrahamToolSystemMessage}`
          );
          const essayInsights = await generateText({
            model: anthropic("claude-3-sonnet-20240229"),
            system: paulGrahamToolSystemMessage,
            messages: conversation,
          });
          console.log(
            `model response from essay insights: ${essayInsights.text}`
          );
          chatHistory.done((history: ServerMessage[]) => [
            ...history,
            {
              role: "assistant",
              content: essayInsights.text,
            },
          ]);
          return (
            <Markdown
              components={{
                p: ({ children }) => <p className="py-2">{children}</p>,
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold my-4">{children}</h1>
                ),
              }}
            >
              {essayInsights.text}
            </Markdown>
          );
        },
      },
    },
  });
  return {
    id: nanoid(),
    role: "assistant",
    display: coreResponse.value,
  };
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    chatServerAction,
  },
  initialAIState: [],
  initialUIState: [],
});
