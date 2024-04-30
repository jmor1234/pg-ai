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