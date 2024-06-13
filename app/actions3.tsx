// file: app/actions.tsx

"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { ReactNode } from "react";
import { z } from "zod";
import { nanoid } from "nanoid";
import Exa from "exa-js";
import Markdown from "react-markdown";
import Image from "next/image";
import Link from "next/link";
import { generateText } from "ai";

const exa = new Exa(process.env.EXA_API_KEY);

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

  const modelResponse = await streamUI({
    model: openai("gpt-4o"),
    system: "You are a helpful AI assistant. When you deem necessary, you can use the exaSearch tool to search the web for relevant information.",
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
      exaSearch: {
        description:
          "When the user deliberately asks for a web search or when you deem the context of the recent message or conversation would benefit from retrieving information from the web, use this tool to do so.",
        parameters: z.object({
          conversation: z.array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            }).describe("This is the entire array of messages from the user and assistant from the conversation so far.")
          ),
        }),
        generate: async function* ({ conversation }) {
          // Log the conversation passed to the exaSearch tool
          console.log("Conversation passed to exaSearch tool:", conversation);

          yield (
            <div className="animate-pulse p-4 bg-primary/10 rounded-md">
              Querying the web for relevant information...
            </div>
          );
          const exaQuery = await generateExaQuery(conversation);
          const highlightQuery = await generateHighlightQuery(
            conversation,
            exaQuery
          );
          const searchResponse = await exa.searchAndContents(exaQuery, {
            numResults: 2,
            useAutoprompt: true,
            highlights: {
              query: highlightQuery,
              highlightsPerUrl: 2,
            },
          });

          // Introduce a delay before showing the next step
          await new Promise(resolve => setTimeout(resolve, 3000));

          yield (
            <div className="animate-pulse p-4 bg-primary/10 rounded-md">
              Understanding and contextualizing relevant information...
            </div>
          );

          // Introduce another delay before finalizing the response
          await new Promise(resolve => setTimeout(resolve, 2000));

          const exaDataForPrompt = searchResponse.results
            .map((result) => {
              const title = result.title
                ? `Title: ${result.title}`
                : "No title available";
              const url = `URL: ${result.url}` || "No URL available";
              const content = result.highlights?.length
                ? `Relevant Content Snippets:\n${result.highlights
                    .map((highlight, index) => `  ${index + 1}. ${highlight}`)
                    .join("\n")}`
                : "No relevant content snippets available";

              return `${title}\n${url}\n${content}`;
            })
            .join("\n\n");

          const systemMessage = `
      You are a helpful assistant that can provide contextually relevant information to the user based on the conversation between the user and the assistant and the web results.

      The conversation between the user and the assistant is as follows:
      ${conversation
        .map((message) => `  ${message.role}: ${message.content}`)
        .join("\n")}

      The web results from the query are as follows:
      ${exaDataForPrompt}

      Your task is to understand the conversation between the user and the assistant and how the web results are relevant to the conversation.
      You return a response back to the user in a conversational manner that provides a contextually relevant response back to the user.

      The web results you receive each have a Title, URL, and Relevant Content Snippets.
      The content snippets are what you will contextually integrate into your response when relevant.
      If you choose to use a content snippet to respond to the user, 
      make sure to cite the source of the content snippet by adding it to the response in a format for example:
      "Sources:
      Title: [Title of the source]
      URL: [URL of the source]"

      Be clear and concise and do not go on to long, aim for brevity.
      `;
          console.log(`System Message: ${systemMessage}`);
          yield (
            <div className="animate-pulse p-4 bg-primary/10 rounded-md">
              Working on my response...
            </div>
          );

          console.log(`Conversation for system prompt: ${JSON.stringify(conversation, null, 2)}`);

          const result = await generateText({
            model: openai("gpt-4o"),
            system: systemMessage,
            messages: conversation,
          });
          console.log(`Model Response back to the user: ${result.text}`);
          chatHistory.done((history: ServerMessage[]) => [
            ...history,
            {
              role: "assistant",
              content: result.text,
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
              {result.text}
            </Markdown>
          );
        },
      },
    },
  });
  return {
    id: nanoid(),
    role: "assistant",
    display: modelResponse.value,
  };
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    chatServerAction,
  },
  initialAIState: [],
  initialUIState: [],
});

async function generateExaQuery(
  conversation: ServerMessage[]
): Promise<string> {
  const { text: exaQuery } = await generateText({
    model: openai("gpt-4o"),
    system: `You are a helpful assistant that generates an optimized Exa query based on a conversation between a user and an assistant. 
      The query should be relevant to the conversation and follow the guidelines for constructing an effective Exa query.

      Guidelines for creating an optimized Exa query:
      1. **Contextual and Descriptive**: Provide enough context so that someone understands what to expect from the content. Think of how you would share a link on social media with a brief description.
      2. **Specific and Clear**: Be precise and clear about the topic. Avoid vague or broad queries.
      3. **High-Quality and Shareable Content**: Reflect high-quality content that is worth sharing.
      4. **Human-like Sharing**: Structure the query as if you are recommending a link to a friend or sharing it online.

      Here are some examples of effective Exa queries:
      - Instead of "best programming languages 2024", use "Here are some of the best programming languages to learn in 2024 for web development and data science."
      - Instead of "latest advancements in AI", use "Check out these latest advancements in AI technology that are shaping the future of machine learning."
      - Instead of "healthy recipes", use "Discover these healthy and easy-to-make recipes for a balanced diet and delicious meals."

      Provide only the query, without any additional text.`,
    messages: [
      ...conversation,
      {
        role: "assistant",
        content: `Here is the optmized Exa query:`,
      },
    ],
  });
  console.log(`exaQuery: ${exaQuery}`);
  return exaQuery;
}

async function generateHighlightQuery(
  conversation: ServerMessage[],
  exaQuery: string
): Promise<string> {
  const { text: highlightQuery } = await generateText({
    model: openai("gpt-4o"),
    system: `You are a helpful assistant that generates a highlight query for the Exa API based on a conversation between a user and an assistant, and an initial Exa query. 
    Here is the initial Exa query: ${exaQuery}

    The highlight query should be relevant to the conversation and the initial Exa query, and follow the guidelines for constructing an effective highlight query.
    
    Guidelines for creating an optimized highlight query:
    1. **Focused and Specific**: The highlight query should be very focused on a specific aspect or question within the broader topic.
    2. **Contextually Relevant**: It should directly relate to the initial Exa query and the key points discussed in the conversation.
    3. **Concise and Direct**: The query should be clear and concise, ensuring that the snippets retrieved are directly relevant to the query.

    Here are some examples of effective highlight queries:
    - If the initial query is "Here is an article discussing the best NBA players of all time: ", a good highlight query might be "Is Michael Jordan actually better than LeBron James all time?"
    - If the initial query is "This article explores the impact of climate change on polar bears: ", a good highlight query might be "How has the polar bear population changed due to climate change?"
    - If the initial query is "Read about the latest advancements in AI technology: ", a good highlight query might be "What are the most significant breakthroughs in AI in the past year?"

    Provide only the highlight query, without any additional text.`,
    messages: [
      ...conversation,
      {
        role: "assistant",
        content: `Here is the optmized highlight query:`,
      },
    ],
  });
  console.log(`highlightQuery: ${highlightQuery}`);
  return highlightQuery;
}


