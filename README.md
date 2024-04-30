**First things first:**
This application is **NOT** a replacement for individually reading all of Paul's Essays. Reading every single word Paul has written is highly recommended.

This can be used to augment and enhance your experience and comprehension whilst reading an essay, enabling you to understand and learn from them in a way not possible by just reading.

## Ways to Augment Reading an Essay with This App:
- Simply copy and paste a quote or sentence from any essay within " " that resonated with you or that you want deeper insight into; you don't even need to provide more context.
- You can provide more context or ask about a specific essay, concept, idea, or really anything within an essay while you're reading.
- Based on your conversation or question, ask what essay would be best for you to read next.

## Separate from reading his essays, this application offers a different, deeper, interactive, and more contextually relevant experience. 
- Ask any question you have about tech, startups, code, money, success, kids, etc. (use the dropdown menu for great starter topics or questions).
- Follow up and have an interactive conversation with an insightful, curious, and empathetic assistant with the sole goal of providing you with the most value from the data in Paul's Essays.

## The multi-conversation/Threads Recall and Clutter issue of most modern LLM Applications
For those like me who consistently use other general AI tools like ChatGPT, Claude.AI, Gemini, etc., I was trying to solve 2 issues that all of these applications currently have:

1. Recall other threads/conversations that you have previously had.
   - If you start a new thread, ChatGPT, Claude.AI, Gemini, etc., do not have recall to your other threads.
   - The lack of recall across different threads or conversations is frustrating. Often, I need to copy and paste important information from previous threads or ask the model to summarize our current thread so I can provide that context in a new thread. This process is tedious and inefficient.
2. Clutter from automatically saving all threads/conversations
   - Those other applications save every conversation by default. For me, I usually have only a couple of ongoing threads that I revisit, and I delete the rest to maintain a clean organization with only the important threads. Deleting most of them to keep things clean is tedious. All I really want is if I deem the current conversation valuable enough, I choose to save that, and then that interaction can be recalled by the assistant whenever contextually relevant.

## How This Application Addresses Those Issues
- With a single click, you can save the current chat if you find it valuable.
- Saved chats are automatically stored under the "Chat History" section.
- You can delete any saved conversation to make necessary adjustments.
- In all subsequent interactions, the assistant will utilize relevant saved conversations to provide more contextual and insightful responses.
- This approach allows you to save only valuable conversations without clutter, as those saved chats will be seamlessly recalled in subsequent interactions when relevant, eliminating the need to copy and paste from previous conversations and try to get your new thread up to speed on the relevant information manually.

## Chat History Section to increase contextual relevance
The interactions become more contextually relevant over time.
Saving valuable conversations is the key way to enable this.

If contextually relevant to the current interaction, any saved conversation will be used to provide deeper insights and contextual interaction.
This enhanced contextual relevance not only makes your interaction with the AI assistant better, but you also get personalized essay recommendations on what to read next based on all your saved conversations.

## Technical Details

This application leverages Claude-3-sonnet, RAG, prompting craftsmanship, and a simple UI to try and augment the experience of reading an essay and to create a new unique interactive experience and ability to have a contextually relevant interaction with such a dense quality and quantity data source like all of Paul's essays.

### Tech Stack:
- Next.js 14 app router TypeScript
- Anthropic's Claude API - Claude-3-Sonnet Model
- Pinecone Vector Database
- Vercel AI SDK
- OpenAI Embeddings Model
- Vercel Postgres
- Prisma ORM
- Vercel Hosting and Deployment
- Clerk Authentication
- ShadCN/UI Component Library
- Cheerio
- Zod Validation

The core "magic" of this application and the Anthropic API use all happens within `app/api/chat/pg-notes/route.ts`:
- I have 2 separate vector databases that I am using for RAG simultaneously:
  - `pg-chunks` index for the chunks of every essay.
  - `notes-gpt` index for all of the user's saved conversations.
- When the user sends a new query, up to the last 10 messages in the current interaction get embedded.
- Using that recent messages embedding, query both `pg-chunks` and `notes-gpt` index for similarity search on the vector embeddings.
- The 5 most relevant saved conversations and Chunks returned are contextually injected into the system message.

### System Message
- Lots of testing and iterating to get it to perform the way I wanted.
- Tried to adhere to the Claude Docs and best practices as best as possible.
- Split into 3 sections:
  - **Role**: Provides the overall context and high-level understanding of the task at hand for the model.
  - **RAG Data injection**: both the Essay Snippets and User's Saved Conversations are injected.
  - **Instructions**: Bullet point format clear precise instructions for what to do and how to interact.

- The order of these is very intentional and important according to the Claude Docs prompt engineering.

### Vercel AI SDK for easy streaming and integration back the frontend UI

## Frontend UI Chat Interface
Located at `app/(frontend)/chats/pg-notes/page.tsx`:
- Vercel AI SDK `useChat` hook.
- Dropdown menu from `kickStarters` array of questions and conversation starters.
- Whisper API Audio Transcription.
- Save Chat Functionality saves the current conversation in the Chat History section.

## Chat History Section
Located at `app/(frontend)/notes`:
- View and Delete any saved conversations.
- Backend Route for saving conversations and creating embeddings `app/api/notes/chatHistory/route.ts`.
- Chat History section stores chats only if the user chooses.
- Doesn't get cluttered saving every chat, only when the user manually saves.

## Scripts
- `scripts/scrape.ts`: Iterating through all essay links, scraping the content of each essay, splitting and chunking the content of each essay into about 300 tokens on average, storing the scraped data in `scripts/pg.json`.
- `scripts/embed.ts`: Embedding and storing each chunk into Pinecone Vector DB.