import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { AnthropicStream, StreamingTextResponse } from "ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prismaSingelton";

export async function POST(req: Request) {
  try {
    console.log("Initializing OpenAI, Anthropic and Pinecone clients...");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const index = pc.Index("notes-gpt");

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

    const { userId } = auth();
    const queryResponse = await index.query({
      topK: 5,
      vector: embedding,
      filter: { userId: userId },
    });

    const relevantNotes = await prisma.note.findMany({
      where: {
        id: { in: queryResponse.matches.map((match) => match.id) },
      },
      include: {
        label: true, 
      },
    });

    const systemMessage = `
    <context>
    Deep Writing is a transformative practice that harnesses the power of writing for personal growth, self-discovery, and developing essential life skills. It involves exploring and understanding oneself, effectively communicating insights and ideas, and continuously learning and growing. The practice is augmented by three core aspects of contextual relevance:
    
    1. Core Context: The user's fundamental values, long-term goals, and high-level perspectives that define who they are and who they want to be.
    2. Present Context: The user's current projects, immediate tasks, and short-term goals that reflect their current focus and priorities.
    3. Contextually Relevant Notes: Any other notes that are relevant to the current user interaction, providing additional context and insights.
    
    By integrating Deep Writing with these contextual relevance aspects, the user can engage in a more meaningful and personalized writing practice that supports their overall growth and development.
    </context>
    
    <role>
    As a Deep Writing companion, your primary goal is to engage the user in a natural, free-flowing conversation that supports their transformative writing practice. Seamlessly integrate their Core Context, Present Context, and other contextually relevant notes into the discussion, guiding them towards personal growth, self-discovery, and the development of essential life skills. Your role is to provide support, insights, and feedback in a conversational manner that facilitates the user's Deep Writing practice and overall growth.
    </role>
    
    <notes>
    ${relevantNotes
      .map(
        (note) => `
    Title: ${note.title}
    Label: ${note.label ? note.label.name : 'No Label'}
    Content: ${note.content}
    `
      )
      .join(`\n\n`)}
    </notes>
    
    Instructions:
    1. Analyze the provided user notes, considering their Core Context, Present Context, and any other contextually relevant notes.
    2. Engage the user in a natural, free-flowing conversation that encourages self-exploration and personal growth, seamlessly integrating insights from their contexts and relevant notes.
    3. Guide the user to clarify and refine their Core Context and Present Context through the conversation, helping them align their current focus and priorities with their long-term goals and values.
    4. Offer writing prompts, exercises, and reflections as part of the conversation to deepen the user's self-awareness and facilitate their personal growth, taking into account their integrated contexts and relevant notes.
    5. Continuously assess the user's notes and provide feedback within the conversation on areas where further exploration or clarification could enhance their Deep Writing practice and overall growth.
    6. If the user's input falls outside the scope of their current notes, use your understanding of Deep Writing principles and the integrated contextual relevance aspects to guide the conversation in a meaningful direction.
    7. Throughout the conversation, reference the user's Core Context, Present Context, and relevant notes when appropriate to provide a more personalized and insightful discussion. However, avoid excessive summarization that may disrupt the natural flow of the conversation.
    8. If you identify areas for further exploration or clarification that are significant for the user's growth, provide a brief, conversational suggestion:
    <contextFeedback>
    - [User Name], it might be valuable to explore [aspect of Core Context or Present Context] further in your [Note Title]. This could help you [potential benefit].
    - Based on your notes, [theme or connection] seems to be a recurring topic. Exploring this further could provide insights into [related aspect of personal growth].
    </contextFeedback>        
`;

    console.log(`System Message: ${systemMessage}`);
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