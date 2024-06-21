// api/notes/memory/route.ts
import { saveChatSchema } from "@/lib/validation/chatHistory";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prismaSingelton";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { generateText, generateObject } from "ai";
import { openai as sdkOpenAI } from "@ai-sdk/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { z } from "zod";
import { anthropic as sdkAnthropic } from "@ai-sdk/anthropic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const chatHistoryIndex = pc.Index("notes-gpt");

const nonSdkAnthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Request body parsed for chat history");
    const validation = saveChatSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation failed for chat history", validation.error);
      return new Response(JSON.stringify({ error: "Invalid chat data" }), {
        status: 400,
      });
    }

    const { title, content, label } = validation.data;
    const { userId } = auth();
    console.log(`Authenticated user ID: ${userId}`);
    if (!userId) {
      console.error("Authentication failed: No user ID found");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Fetch the label ID from the database
    const labelRecord = await prisma.label.findFirst({
      where: { name: label },
      select: { id: true },
    });

    if (!labelRecord) {
      console.error("Label not found in database for:", label);
      return new Response(JSON.stringify({ error: "Label not found" }), {
        status: 404,
      });
    }

    // Check for existing notes under the "Chat History" label
    const existingNotes = await prisma.note.findMany({
      where: {
        userId: userId,
        label: {
          name: "Chat History",
        },
      },
      select: {
        content: true,
      },
    });

    console.log(
      `Found ${existingNotes.length} existing notes for user ID: ${userId}`
    );

    let systemMessage, userMessage;
    if (existingNotes.length > 0) {
      // Case where existing notes are found
      const existingInformation = existingNotes
        .map((note) => note.content)
        .join("\n\n");
      console.log("Existing information compiled for distillation");
      systemMessage = `
<role>
You are an AI assistant responsible for creating new distilled notes from conversations between users and AI assistants, taking into account the user's existing distilled notes. 
Your primary objective is to identify and extract new, unique, and critical information from the latest conversation that is not already present in the user's existing distilled notes. 
Your goal is to create a new note in bullet points that captures novel and pertinent insights that are not already within the original distilled notes.
Your role for this task is NOT to be conversational AT ALL. You just perform the task of distilling the conversation in clear concise bullet points WITHOUT any conversational elements.
</role>

The raw conversation that you will receive from the user will be formatted as:

user: [user message] \n\n
assistant: [assistant response]

The existing information that you already have on the user is as follows:

${existingInformation}

<instructions>
- Carefully review the provided conversation and compare it with the user's existing distilled notes.
- Identify new, unique, and critical information from the latest conversation that is not already captured in the existing notes.
- Focus on extracting novel insights, important context, or valuable suggestions that can enhance the user's existing information.
- Create a new distilled note that captures the unique and relevant information from the latest conversation in clear concise bullet points.
- Ensure that the new note does not duplicate information already present in the existing notes.
- Prioritize information that is most likely to be relevant and useful in future interactions with the user.
- You do not have access to edit or modify the existing distilled notes provided to you. Your task is to create a new note based on the latest conversation and the existing information.
- Do not include any conversational elements, such as greetings, questions, or requests for feedback, in your output. Simply provide the new distilled note without any additional commentary.
- If there is no new value to add because the information is already present in existing notes or the current conversation has no important pieces to add, simply say "No new information to add."
</instructions>
`;
      console.log("System Message for existing notes:", systemMessage);
      userMessage = {
        role: "user" as "user",
        content: `here is the current raw conversation: \n\n${content}`,
      };
    } else {
      // Case where no existing notes are found
      console.log("No existing notes found for user ID:", userId);
      systemMessage = `
<role>
You are an AI assistant responsible for distilling conversations between users and AI assistants down to their most essential elements. 
Your primary objective is to identify and extract the most critical information from these conversations and present it in a clear, concise, and coherent bullet point format.
Your role for this task is NOT to be conversational AT ALL. You just perform the task of distilling the conversation in clear concise bullet points WITHOUT any conversational elements.
</role>

What to expect:
- The conversations will be formatted as follows:
user: [user message] \n\n
assistant: [assistant response]

<instructions>
- Meticulously review the provided conversations, identifying the most important details, context, and insights.
- Ruthlessly eliminate any unnecessary or irrelevant information, focusing solely on the essential elements.
- Extract and highlight the most critical user information, such as core preferences, goals, or personal details, that will likely be relevant in future interactions.
- Identify and summarize the most pertinent situational details and context that will help the AI better understand the user's needs and perspective in bullet points.
- Capture the most valuable insights, suggestions, or solutions provided by the AI during the conversation, as these may prove most useful in subsequent interactions.
- Present the distilled information in a highly structured, easily digestible bullet point format that the AI can quickly reference and apply in contextually relevant future conversations, with an emphasis on clarity, concision, and coherence.
- Do not include any conversational elements, such as greetings, questions, or requests for feedback, in your output. Simply provide the concise bullet point summary without any additional commentary.
</instructions>
`;
      console.log(
        "System Message when no existing notes are found:",
        systemMessage
      );
      userMessage = {
        role: "user" as "user",
        content: `here is the current raw conversation to be distilled: \n\n${content}`,
      };
    }

    const response = await nonSdkAnthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      system: systemMessage,
      messages: [
        userMessage,
        {
          role: "assistant",
          content: "Key Insights:",
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const conversationDistillation = response.content[0].text;

    const createNoteBoolean = await generateObject({
      model: sdkAnthropic("claude-3-5-sonnet-20240620"),
      schema: z.object({
        thoughtProcess: z.string().describe("The thought process that you went through to determine if there is new valuable information to create a new note from or not."),
        newValuableInformation: z.boolean().describe("True or False based on if there is new valuable information to create a new note from or not."),
      }),
      prompt: `
        <context>
        You are an AI assistant responsible for determining whether a distilled conversation contains new valuable information worth creating a new note for. The purpose of this memory functionality is to save distilled notes that capture novel and pertinent insights, important context, or valuable suggestions that can enhance the user's existing information and be relevant in future interactions.
        </context>
        
        <distilledConversation>
        ${conversationDistillation}
        </distilledConversation>
        
        <existingNotes>
        ${existingNotes.length > 0 ? existingNotes.map(note => note.content).join('\n\n') : 'No existing notes found.'}
        </existingNotes>
        
        <instructions>
        Carefully analyze the distilled conversation and compare it with the user's existing notes (if any). Determine whether the distilled conversation contains new valuable information that is not already present in the existing notes and is worth creating a new note for.
        
        Consider the following criteria:
        - Does the distilled conversation provide novel insights, important context, or valuable suggestions that enhance the user's existing information?
        - Is the information in the distilled conversation likely to be relevant and useful in future interactions with the user?
        - Does the distilled conversation contain information that is not already captured in the existing notes?
        
        Provide a thought process explaining your reasoning and conclude with a clear "True" or "False" indicating whether a new note should be created.
        </instructions>
        `,
    });

    const createNoteResult = createNoteBoolean.object.newValuableInformation;
    const createNoteReasoning = createNoteBoolean.object.thoughtProcess;

    console.log("Create Note Result:", createNoteResult);
    console.log("Create Note Reasoning:", createNoteReasoning);

    if (createNoteResult) {
      const coreDataToBeEmbedded = `${conversationDistillation}`;

      console.log("Text to be embedded for chat history:", coreDataToBeEmbedded);

      const createEmbedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: coreDataToBeEmbedded,
      });

      const coreDataEmbeddingResult = createEmbedding.data[0].embedding;

      const createChatHistory = await prisma.$transaction(async (tx) => {
        const createChatHistory = await tx.note.create({
          data: {
            title: title,
            content: conversationDistillation,
            userId,
            label: {
              connect: { id: labelRecord.id },
            },
          },
        });
        await chatHistoryIndex.upsert([
          {
            id: createChatHistory.id,
            values: coreDataEmbeddingResult,
            metadata: { userId },
          },
        ]);
        return createChatHistory;
      });
      console.log("Chat history created and indexed successfully");

      return new Response(
        JSON.stringify({
          message: "Chat histories created and indexed successfully",
        }),
        { status: 201 }
      );
    } else {
      console.log("No new valuable information found. Skipping note creation.");

      return new Response(
        JSON.stringify({
          message: "No new valuable information found. Skipping note creation.",
        }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error during POST operation:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
