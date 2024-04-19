import React from "react";

const AboutPage = () => {
  return (
    <div className="p-8 max-w-prose">
      <h1 className="text-xl font-bold">PG-Context Application</h1>

      <h2 className="mt-4 text-lg font-semibold">First things first:</h2>
      <p>
        This application is <strong>NOT</strong> a replacement for individually
        reading all of Paul’s Essays. Reading every single word Paul has written
        is highly recommended.
      </p>
      <p>
        This can be used to augment and enhance your experience and
        comprehension whilst reading an essay, enabling you to understand and
        learn from them in a way not possible by just reading.
      </p>

      <h2 className="mt-4 text-lg font-semibold">
        Ways to Augment Reading an Essay with This App:
      </h2>
      <ul className="list-disc pl-5">
        <li>
          Simply just copy and paste a quote or sentence from any essay within
          &ldquo; &rdquo; that resonated with you or that you want deeper
          insight into, you d on&apos;t even need to provide more context.
        </li>
        <li>
          You can provide more context or ask about a specific essay, concept,
          idea or really anything within an essay while you&apos;re reading etc.
        </li>
        <li>
          Based on your conversation or question, ask what essay would be best
          for you to read next.
        </li>
      </ul>

      <p className="mt-4 text-lg font-semibold">
        Separate from reading his essays, this application offers a different,
        deeper, interactive and more contextually relevant experience.
      </p>
      <ul className="list-disc pl-5">
        <li>
          Ask any question you have, tech, startups, code, money, success, kids
          etc…(use the dropdown menu for great starter topic or questions).
        </li>
        <li>
          Follow up and have an interactive conversation with an insightful,
          curious and empathetic assistant with the sole goal to provide you the
          most value from the data in Paul&apos;s Essays.
        </li>
        <li>
          Valuable without directly providing any additional information about
          yourself or saving your conversations.
        </li>
      </ul>

      <h2 className="mt-4 text-lg font-semibold">
        The multi-conversation/Threads Recall and Clutter issue of most modern
        LLM Applications
      </h2>
      <p>
        For those like me who consistently use other general AI tools, ChatGPT,
        Claude.AI, Gemini etc...
      </p>
      <ol className="list-decimal pl-5">
        <li>
          Recall other threads/conversations that you have previously had.
        </li>
        <li>Clutter from automatically saving all threads/conversations.</li>
      </ol>

      <h2 className="mt-4 text-lg font-semibold">
        How This Application Addresses Those Issues
      </h2>
      <ul className="list-disc pl-5">
        <li>
          With a single click, you can save the current chat if you find it
          valuable.
        </li>
        <li>
          Saved chats are automatically stored under the &ldquo;Chat
          History&ldquo; label within notes.
        </li>
        <li>
          You can edit or delete any saved conversation to make necessary
          adjustments.
        </li>
        <li>
          In all subsequent interactions, the assistant will utilize relevant
          saved conversations to provide more contextual and insightful
          responses.
        </li>
        <li>
          This approach allows you to save only valuable conversations without
          clutter, as those saved chats will be seamlessly recalled in
          subsequent interactions when relevant, eliminating the need to copy
          and paste from previous conversations, and try to get your new thread
          up to speed on the relevant information manually.
        </li>
      </ul>

      <h2 className="mt-4 text-lg font-semibold">
        Notes Section to increase contextual relevance
      </h2>
      <p>
        The interactions become more contextually relevant overtime if you
        want/allow them to be.
      </p>
      <p>
        Adding Notes to be recalled when relevant to a conversation is the key
        way to enable this.
      </p>
      <ul className="list-disc pl-5">
        <li>“Background”</li>
        <li>“Currently Working On”</li>
        <li>“Current Challenges”</li>
        <li>“Long Term Goals”</li>
        <li>“Curiosities and Considerations”</li>
      </ul>

      <h2 className="mt-4 text-lg font-semibold">Technical Details</h2>
      <p>
        This application just leverages Claude-3-sonnet, RAG, prompting
        craftsmanship, and a simple UI to try and augment the experience of
        reading an essay, and to create a new unique interactive experience and
        ability to have a contextually relevant interaction with such a dense
        quality and quantity data source like all of Paul’s essays.
      </p>

      <h3 className="mt-4 text-lg font-semibold">Tech Stack:</h3>
      <ul className="list-disc pl-5">
        <li>Next.js 14 app router TypeScript</li>
        <li>Anthropic’s Claude API - Claude-3-Sonnet Model</li>
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

      <h3 className="mt-4 text-lg font-semibold">Frontend UI Chat Interface</h3>
      <p>
        Located at <code>app/(frontend)/chats/pg-notes/page.tsx</code>:
      </p>
      <ul className="list-disc pl-5">
        <li>
          Vercel AI SDK <code>useChat</code> hook.
        </li>
        <li>
          Dropdown menu from <code>kickStarters</code> array of questions and
          conversation starters.
        </li>
        <li>Whisper API Audio Transcription.</li>
        <li>
          Save Chat Functionality creates a new note within the Chat History
          label.
        </li>
      </ul>

      <h3 className="mt-4 text-lg font-semibold">Notes Section</h3>
      <p>
        Located at <code>app/(frontend)/notes</code>:
      </p>
      <ul className="list-disc pl-5">
        <li>Create, Edit and Delete any notes.</li>
        <li>
          Can Use Whisper API audio transcription to create note contents.
        </li>
        <li>
          Backend Route for notes and creating embeddings{" "}
          <code>app/api/notes/route.ts</code>.
        </li>
        <li>Organize and Filter with Custom labels.</li>
        <li>
          Preset Labels to help the user provide contextually relevant
          information to enhance their experience.
        </li>
        <li>Chat History Label stores chats only if the user chooses.</li>
        <li>
          User can edit their saved conversations to make adjustments whenever
          needed.
        </li>
      </ul>

      <h3 className="mt-4 text-lg font-semibold">Scripts</h3>
      <ul className="list-disc pl-5">
        <li>
          <code>scripts/scrape.ts</code>: Iterating through all essay links,
          scraping the content of each essay, splitting and chunking the content
          of each essay into about 300 tokens on average, storing the scraped
          data in <code>scripts/pg.json</code>.
        </li>
        <li>
          <code>scripts/embed.ts</code>: Embedding and storing each chunk into
          Pinecone Vector DB.
        </li>
      </ul>
    </div>
  );
};

export default AboutPage;
