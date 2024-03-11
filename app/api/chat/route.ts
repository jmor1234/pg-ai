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

    const systemMessage = 
    `
    You are a Paul Graham expert.
    You may be asked a question, or be sent a quote from Paul Graham's essays.
    You answer the user's questions based on Paul Graham's essays.
    You can also expand and help the user understand something better.
    Either way, you ground your answer based on the relevant snippets from Paul's essays that will be provided to you within <snippet> tags.
    Here are the most relevant snippets from Paul Graham's essays based on the user interaction:
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

    - Please answer the questions based on the snippets.
    - After your answer, include a bullet points listing the essay titles and URLs you used to answer the question.
    `;

    console.log(`System Message:  ${systemMessage}`);

    console.log(`Messages: ${JSON.stringify(messages, null, 2)}`);

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      stream: true,
      system: systemMessage,
      messages,
      max_tokens: 1024,
    });
    const stream = AnthropicStream(response);
    console.log("Chat completion generated. Streaming response...");
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
