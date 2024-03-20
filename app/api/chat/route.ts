import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { AnthropicStream, StreamingTextResponse } from "ai";
import { Pinecone } from "@pinecone-database/pinecone";

export async function POST(req: Request) {
  try {
    console.log("Initializing OpenAI, Anthropic and Pinecone clients...");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const index = pc.Index("pg-ai");

    const { messages } = await req.json();
    console.log(
      `Received ${messages.length} messages. Processing the last 6 messages...`
    );
    const lastSixMess = messages.slice(-6);
    const lastSixMessEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: lastSixMess
        .map((message: { role: string; content: string }) => {
          return message.content;
        })
        .join("\n"),
    });

    console.log("Embedding created. Querying the Pinecone index...");
    const embedding = lastSixMessEmbedding.data[0].embedding;

    const queryResponse = await index.query({
      topK: 5,
      vector: embedding,
      includeMetadata: true,
    });

    console.log("Query completed. Processing matches...");
    const matches = queryResponse.matches.map((match) => {
      if (match.metadata) {
        return {
          title: match.metadata.essay_title,
          url: match.metadata.essay_url,
          content: match.metadata.content,
        };
      } else {
        return {
          title: "Unknown Title",
          url: "#",
          content: "No content available",
        };
      }
    });

    const systemMessage = `
    <role>
    You are an expert on Paul Graham's essays.
    During your interaction with the user, 
    you will be sent the most relevant snippets across all of Paul Graham's essays based on the current user interaction.
    The snippets will be provided to you within <snippets> tags.
    You will use these snippets to help the user gain a deeper understanding and insight into the quote or question they send you.
    Or the user might just want to continue an interative conversation with you.
    </role>


    Here are the most relevant snippets from across all of Paul Graham's essays based on the current user interaction:
    <snippets>
        ${matches
          .map(
            (match) =>
              `Title: ${match.title}
                URL: ${match.url}
                Content: ${match.content}`
          )
          .join(`\n\n`)}
    </snippets>

    <quote_instructions>
    If given a quote:
    1. Recognize that the user found this quote insightful during their reading, and it resonated with them. 
    2. Use the provided snippets to help them gain a deeper understanding and insight into the quote.
    </quote_instructions>

    <question_instructions>  
    If asked a question:
    1. Identify the most relevant snippets to the question.
    2. Use those snippets to help the user gain a deeper understanding and insight into what they are asking about.
    </question_instructions>

    <conversation_instructions>
    If the user wants to continue an interactive conversation:
    1. Use the provided snippets to help guide the conversation.
    2. Provide relevant insights based on the essay content.
    </conversation_instructions>

    <think>
    Before responding, carefully consider:
    1. What type of input the user has provided (quote, question, or conversation)
    2. Which snippets are most relevant to addressing their input
    3. How to structure your response to provide the most insight and value
    </think>

    After your response, include a list of the essay titles and URLs you referenced, formatted as:
    - Title (URL)
    - Title (URL)
    `;

    console.log(`System Message:  ${systemMessage}`);

    console.log(`Messages: ${JSON.stringify(messages, null, 2)}`);

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      stream: true,
      system: systemMessage,
      messages,
      max_tokens: 4000,
      temperature: 0.5,
    });
    const stream = AnthropicStream(response);
    console.log("Chat completion generated. Streaming response...");
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
