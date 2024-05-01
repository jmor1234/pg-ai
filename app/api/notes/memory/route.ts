// api/notes/memory/route.ts
import { saveChatSchema } from "@/lib/validation/chatHistory";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prismaSingelton";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
import { Pinecone } from "@pinecone-database/pinecone";
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const chatHistoryIndex = pc.Index("notes-gpt");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

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
      return new Response(JSON.stringify({ error: "Label not found" }), {
        status: 404,
      });
    }

    // Check for existing notes under the "Chat History" label
    const existingNotes = await prisma.note.findMany({
      where: {
        userId: userId,
        label: {
          name: 'Chat History'
        }
      },
      select: {
        content: true
      },
    });

    let systemMessage, userMessage;
    if (existingNotes.length > 0) {
      // Case where existing notes are found
      const existingInformation = existingNotes.map(note => note.content).join('\n\n');
      systemMessage = `
<role>
You are an AI assistant responsible for creating new distilled notes from conversations between users and AI assistants, taking into account the user's existing distilled notes. 
Your primary objective is to identify and extract new, unique, and critical information from the latest conversation that is not already present in the user's existing distilled notes. 
Your goal is to create a new note that captures novel and pertinent insights while maintaining the clarity, concision, and coherence of the original distilled notes.
Your role for this task is NOT to be conversational AT ALL. You just perform the task of distilling the conversation WITHOUT any conversational elements.
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
- Create a new distilled note that captures the unique and relevant information from the latest conversation.
- Ensure that the new note does not duplicate information already present in the existing notes.
- Prioritize information that is most likely to be relevant and useful in future interactions with the user.
- Present the new distilled note in the same clear, concise, and coherent format as the original notes, focusing on readability and ease of reference.
- Do not edit or modify the existing distilled notes provided to you. Your task is to create a new note based on the latest conversation and the existing information.
- Do not include any conversational elements, such as greetings, questions, or requests for feedback, in your output. Simply provide the new distilled note without any additional commentary.
</instructions>
`;

      userMessage = {
        role: "user" as "user",
        content: `here is the current raw conversation: \n\n${content}`,
      };
    } else {
      // Case where no existing notes are found
      systemMessage = `
<role>
You are an AI assistant responsible for distilling conversations between users and AI assistants down to their most essential elements. 
Your primary objective is to identify and extract the most critical information from these conversations and present it in a clear, concise, and coherent format.
Your role for this task is NOT to be conversational AT ALL. You just perform the task of distilling the conversation WITHOUT any conversational elements.
</role>

What to expect:
- The conversations will be formatted as follows:
user: [user message] \n\n
assistant: [assistant response]

<instructions>
- Meticulously review the provided conversations, identifying the most important details, context, and insights.
- Ruthlessly eliminate any unnecessary or irrelevant information, focusing solely on the essential elements.
- Extract and highlight the most critical user information, such as core preferences, goals, or personal details, that will likely be relevant in future interactions.
- Identify and summarize the most pertinent situational details and context that will help the AI better understand the user's needs and perspective.
- Capture the most valuable insights, suggestions, or solutions provided by the AI during the conversation, as these may prove most useful in subsequent interactions.
- Present the distilled information in a highly structured, easily digestible format that the AI can quickly reference and apply in contextually relevant future conversations, with an emphasis on clarity, concision, and coherence.
- Do not include any conversational elements, such as greetings, questions, or requests for feedback, in your output. Simply provide the concise summary without any additional commentary.
</instructions>`;

      userMessage = {
        role: "user" as "user",
        content: `here is the current raw conversation to be distilled: \n\n${content}`,
      };
    }

    // Continue with the rest of the function...
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      system: systemMessage,
      messages: [userMessage,
    {
        role: "assistant",
        content: "Key Insights: \n\n -"
    }],
      max_tokens: 4000,
      temperature: 0.5,
    });

    const conversationDistillation = response.content[0].text;

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
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
