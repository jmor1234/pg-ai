import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";
import Link from "next/link";
import React from 'react';

const ApplicationOutline = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-prose rounded-xl shadow-lg">
      <Link href="/">
        <Button className="mb-4">
          <HomeIcon className="mr-2" size={20} />
          Home
        </Button>
      </Link>
      <div className="bg-primary text-secondary px-4 py-2 rounded-md mb-8">
        <strong>First things first:</strong>
        <p className="mt-2">
          This application is <strong>NOT</strong> a replacement for individually reading all of Paul&apos;s Essays. Reading every single word Paul has written is highly recommended.
        </p>
        <p className="mt-2">
          This can be used to augment and enhance your experience and comprehension whilst reading an essay, enabling you to understand and learn from them in a way not possible by just reading.
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-4">Ways to Augment Reading an Essay with This App:</h2>
      <ul className="list-disc list-inside mb-8">
        <li>Simply copy and paste a quote or sentence from any essay within &ldquo; &rdquo; that resonated with you or that you want deeper insight into; you don&apos;t even need to provide more context.</li>
        <li>You can provide more context or ask about a specific essay, concept, idea, or really anything within an essay while you&apos;re reading.</li>
        <li>Based on your conversation or question, ask what essay would be best for you to read next.</li>
      </ul>

      <h2 className="text-2xl font-bold mb-4">Separate from reading his essays, this application offers a different, deeper, interactive, and more contextually relevant experience.</h2>
      <ul className="list-disc list-inside mb-8">
        <li>Ask any question you have about tech, startups, code, money, success, kids, etc. (use the dropdown menu for great starter topics or questions).</li>
        <li>Follow up and have an interactive conversation with an insightful, curious, and empathetic assistant with the sole goal of providing you with the most value from the data in Paul&apos;s Essays.</li>
      </ul>

      <h2 className="text-2xl font-bold mb-4">The multi-conversation/Threads Recall and Clutter issue of most modern LLM Applications</h2>
      <p className="mb-4">
        For those like me who consistently use other general AI tools like ChatGPT, Claude.AI, Gemini, etc., I was trying to solve 2 issues that all of these applications currently have:
      </p>
      <ol className="list-decimal list-inside mb-8">
        <li>
          <strong>Recall other threads/conversations that you have previously had.</strong>
          <ul className="list-disc list-inside ml-6 mt-2">
            <li>If you start a new thread, ChatGPT, Claude.AI, Gemini, etc., do not have recall to your other threads.</li>
            <li>The lack of recall across different threads or conversations is frustrating. Often, I need to copy and paste important information from previous threads or ask the model to summarize our current thread so I can provide that context in a new thread. This process is tedious and inefficient.</li>
          </ul>
        </li>
        <li>
          <strong>Clutter from automatically saving all threads/conversations</strong>
          <ul className="list-disc list-inside ml-6 mt-2">
            <li>Those other applications save every conversation by default. For me, I usually have only a couple of ongoing threads that I revisit, and I delete the rest to maintain a clean organization with only the important threads. Deleting most of them to keep things clean is tedious. All I really want is if I deem the current conversation valuable enough, I choose to save that, and then that interaction can be recalled by the assistant whenever contextually relevant.</li>
          </ul>
        </li>
      </ol>

      <h2 className="text-2xl font-bold mb-4">How This Application Addresses Those Issues</h2>
      <ul className="list-disc list-inside mb-8">
        <li>With a single click, you can save the current chat if you find it valuable.</li>
        <li>Saved chats are automatically stored under the &ldquo;Chat History&rdquo; section.</li>
        <li>You can delete any saved conversation to make necessary adjustments.</li>
        <li>In all subsequent interactions, the assistant will utilize relevant saved conversations to provide more contextual and insightful responses.</li>
        <li>This approach allows you to save only valuable conversations without clutter, as those saved chats will be seamlessly recalled in subsequent interactions when relevant, eliminating the need to copy and paste from previous conversations and try to get your new thread up to speed on the relevant information manually.</li>
      </ul>

      <h2 className="text-2xl font-bold mb-4">Chat History Section to increase contextual relevance</h2>
      <p className="mb-4">
        The interactions become more contextually relevant over time.
        Saving valuable conversations is the key way to enable this.
      </p>
      <p className="mb-4">
        If contextually relevant to the current interaction, any saved conversation will be used to provide deeper insights and contextual interaction.
        This enhanced contextual relevance not only makes your interaction with the AI assistant better, but you also get personalized essay recommendations on what to read next based on all your saved conversations.
      </p>

      <h2 className="text-2xl font-bold mb-4">Technical Details</h2>
      <p className="mb-4">
        This application leverages Claude-3-sonnet, RAG, prompting craftsmanship, and a simple UI to try and augment the experience of reading an essay and to create a new unique interactive experience and ability to have a contextually relevant interaction with such a dense quality and quantity data source like all of Paul&apos;s essays.
      </p>

      <h3 className="text-xl font-bold mb-2">Tech Stack:</h3>
      <ul className="list-disc list-inside mb-8">
        <li>Next.js 14 app router TypeScript</li>
        <li>Anthropic&apos;s Claude API - Claude-3-Sonnet Model</li>
        <li>Pinecone Vector Database</li>
        <li>Vercel AI SDK</li>
        <li>OpenAI Embeddings Model</li>
        <li>Vercel Postgres</li>
        <li>Prisma ORM</li>
        <li>Vercel Hosting and Deployment</li>
        <li>Clerk Authentication</li>
        <li>ShadCN/UI Component Library</li>
        <li>Cheerio</li>
        <li>Zod Validation</li>
      </ul>

      <p className="mb-4">
        The core &ldquo;magic&rdquo; of this application and the Anthropic API use all happens within <code>app/api/chat/pg-notes/route.ts</code>:
      </p>
      <ul className="list-disc list-inside mb-8">
        <li>
          I have 2 separate vector databases that I am using for RAG simultaneously:
          <ul className="list-disc list-inside ml-6 mt-2">
            <li><code>pg-chunks</code> index for the chunks of every essay.</li>
            <li><code>notes-gpt</code> index for all of the user&apos;s saved conversations.</li>
          </ul>
        </li>
        <li>When the user sends a new query, up to the last 10 messages in the current interaction get embedded.</li>
        <li>Using that recent messages embedding, query both <code>pg-chunks</code> and <code>notes-gpt</code> index for similarity search on the vector embeddings.</li>
        <li>The 5 most relevant saved conversations and Chunks returned are contextually injected into the system message.</li>
      </ul>

      <h3 className="text-xl font-bold mb-2">System Message</h3>
      <ul className="list-disc list-inside mb-8">
        <li>Lots of testing and iterating to get it to perform the way I wanted.</li>
        <li>Tried to adhere to the Claude Docs and best practices as best as possible.</li>
        <li>
          Split into 3 sections:
          <ul className="list-disc list-inside ml-6 mt-2">
            <li><strong>Role</strong>: Provides the overall context and high-level understanding of the task at hand for the model.</li>
            <li><strong>RAG Data injection</strong>: both the Essay Snippets and User&apos;s Saved Conversations are injected.</li>
            <li><strong>Instructions</strong>: Bullet point format clear precise instructions for what to do and how to interact.</li>
          </ul>
        </li>
        <li>The order of these is very intentional and important according to the Claude Docs prompt engineering.</li>
      </ul>

      <h3 className="text-xl font-bold mb-2">Vercel AI SDK for easy streaming and integration back the frontend UI</h3>

      <h2 className="text-2xl font-bold mb-4">Frontend UI Chat Interface</h2>
      <p className="mb-4">
        Located at <code>app/(frontend)/chats/pg-notes/page.tsx</code>:
      </p>
      <ul className="list-disc list-inside mb-8">
        <li>Vercel AI SDK <code>useChat</code> hook.</li>
        <li>Dropdown menu from <code>kickStarters</code> array of questions and conversation starters.</li>
        <li>Whisper API Audio Transcription.</li>
        <li>Save Chat Functionality saves the current conversation in the Chat History section.</li>
      </ul>

      <h2 className="text-2xl font-bold mb-4">Chat History Section</h2>
      <p className="mb-4">
        Located at <code>app/(frontend)/notes</code>:
      </p>
      <ul className="list-disc list-inside mb-8">
        <li>View and Delete any saved conversations.</li>
        <li>Backend Route for saving conversations and creating embeddings <code>app/api/notes/chatHistory/route.ts</code>.</li>
        <li>Chat History section stores chats only if the user chooses.</li>
        <li>Doesn&apos;t get cluttered saving every chat, only when the user manually saves.</li>
      </ul>

      <h2 className="text-2xl font-bold mb-4">Scripts</h2>
      <ul className="list-disc list-inside">
        <li><code>scripts/scrape.ts</code>: Iterating through all essay links, scraping the content of each essay, splitting and chunking the content of each essay into about 300 tokens on average, storing the scraped data in <code>scripts/pg.json</code>.</li>
        <li><code>scripts/embed.ts</code>: Embedding and storing each chunk into Pinecone Vector DB.</li>
      </ul>
      <Link href="/">
        <Button className="mt-4">
          <HomeIcon className="mr-2" size={20} />
          Home
        </Button>
      </Link>
    </div>
  );
};

export default ApplicationOutline;