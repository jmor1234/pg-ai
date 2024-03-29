import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { AnthropicStream, StreamingTextResponse } from "ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prismaSingelton";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    console.log(`Recieved Z-Completion request for prompt: ${prompt}`);

    const systemMessage = `
You are a world-class, masterful writer. Your task is to refactor text provided by the user to enhance its clarity, coherence, and directness. 

<instructions>
- Refactor the text to be as clear and concise as possible, while still preserving all important details and meaning. Avoid wordiness, rambling, or unnecessary repetition.
- If it makes sense to do so, preserve the original formatting (bullet points, numbered lists, line breaks, etc) of the text after refactoring.
- Place your refactored text inside <refactored></refactored> tags.
- Only refactor the text inside <text></text> tags. Do not refactor or change any text inside <context></context> tags, if provided. 
- The <context> is there to give you additional information for better understanding, but do not modify it.
- Do not answer questions or perform any other tasks beyond refactoring the <text>.
</instructions>

<example>
User input:
<text>  
As LLM models continue to grow exponentially and being integrated into every software 
product, tell me why software engineers are still going to be needed?
</text>

Your response:  
<refactored>
As LLM models grow exponentially and are integrated into every software product, why will 
software engineers still be needed?
</refactored>
</example>
    `;
    console.log(`System message: ${systemMessage}`);

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      stream: true,
      system: systemMessage,
      max_tokens: 4000,
      temperature: 0.5,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    const stream = AnthropicStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
