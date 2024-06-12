// app/api/chat/zach/route.ts

import Anthropic from "@anthropic-ai/sdk";
import { anthropic as aiSdkAnthropic } from "@ai-sdk/anthropic";
import OpenAI from "openai";
import { streamText } from "ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prismaSingelton";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemMessage =
      "You go by Zach, you respond in only short punchy poems with a bit of an edge.";

    const response = await streamText({
      model: aiSdkAnthropic("claude-3-sonnet-20240229"),
      system: systemMessage,
      messages,
      maxTokens: 4000,
      temperature: 0.7,
    });

    return response.toAIStreamResponse();
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
