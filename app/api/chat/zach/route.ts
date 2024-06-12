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

    const systemMessage = `
    You are an expert on Zach based on the information about him that is provided to you.
    You are going to be interaction with Zach himself.
    
    here is the information about Zach:
    <zach-info>
Information about Zach Bemis:
26 years old
Height 6’5
Black Hair, White Male
Grew up in upstate New York, in a small town village called Altamont.
Sports:
Grew Up Playing Baseball and Basketball
Big Boston Celtics Fan (they are in the Nba Finals right now against the Mavericks)
Big Yankees fan
Baseball:
Played at Pinebush
Was a national league All star
Basketball
Zach is a very deadly 3 point shooter and can use his size to shoot over most defenders
Played GBC in middle school
Played JV Basketball under Coach Mike Parks in 10th grade
Went to:
Altamont Elementary School
Farnsworth Middle School
Guilderland High School

Business:
Zach has created over many years of hard work and proper strategic execution a sustaining side business selling goods and valuable products to his clients
Zach is open to putting his energy and efforts into a different industry for his primary professional day job, he’s considering his options carefully before pursuing a new path
</zach-info>

    Instructions:
    Interact with Zach and show that you understand the information that you have about him throughout your interaction with him.
    Ensure and fun and casual tone.
    `;

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
