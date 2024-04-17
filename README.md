PG-Context application: https://pg-ai-orpin.vercel.app/

**First things first:**
This application is **NOT** a replacement for individually reading all of Paul’s Essays. Reading every single word Paul has written is highly recommended.

This can be used to augment and enhance your experience and comprehension whilst reading an essay, enabling you to understand and learn from them in a way not possible by just reading.

## Ways to Augment Reading an Essay with This App:
- Simply just copy and paste a quote or sentence from any essay within “ ” that resonated with you or that you want deeper insight into, you don't even need to provide more context.
- You can provide more context or ask about a specific essay, concept, idea or really anything within an essay while you're reading etc.
- Based on your conversation or question, ask what essay would be best for you to read next.

## This can be used in addition to or separate from reading his essays for a completely different, deeper and contextually relevant experience. 
- Ask any question you have, tech, startups, code, money, success, kids etc…(use the dropdown menu for great starter topic or questions).
- Follow up and have an interactive conversation with an insightful, curious and empathetic assistant with the sole goal to provide you the most value from the data in Paul's Essays.
- Valuable without directly providing any additional information about yourself or saving your conversations.

## Contextual Relevance
The interactions become more contextually relevant overtime if you want/allow them to be.
- Simply by saving a current chat if find it valuable with one click.
- Saves automatically under “Chat History” label within notes.
- Can edit or delete any saved conversation.
- In all subsequent interactions the assistant will use that saved conversation when relevant to provide more contextual and insightful responses.

## Notes Section
Preset labels to guide the user towards providing information that would enhance their experience of:
- “Background”
- “Currently Working On”
- “Current Challenges"
- “Long Term Goals”
- “Curiosities and Considerations”

If contextually relevant to the current interaction, any note the user creates will be used to provide deeper insights and contextual interaction.
This enhanced contextual relevance not only makes your interaction with the AI assistant better, but you get personalized essay recommendation on what to read next based on all your conversations and notes that you provided.

## Technical Details

This application just leverages Claude-3-sonnet, RAG, prompting craftsmanship, and a simple UI to try and augment the experience of reading an essay, and to create a new unique interactive experience and ability to have a contextually relevant interaction with such a dense quality and quantity data source like all of Paul’s essays.

### RAG for Contextually Relevant Interaction
Leveraging both the external data (Paul’s Essays) and internal data (the user’s notes and saved previous conversations) to get the best experience.

The user does not need to provide any information about themselves if they don't want to. You will get a great experience and interaction with the AI Assistant conversing and giving you insights based on relevant Paul Graham essay data.

To significantly enhance their experience, the more internal data the user provides, the more contextually relevant the insights and interaction can be:
- Preset Labels to get the user thinking in the right direction:
  - “Background”
  - “Currently Working On”
  - “Long Term Goals”
  - “Current Challenges”
  - “Curiosities and Considerations”

The last preset label is “Chat History”:
- The notes within here are automatically created when the user chooses to save their current conversation if they deem valuable.
- Doesn't get cluttered, the user only saves interactions they choose to.
- Can Edit and Delete their Chat History Notes whenever needed to set better context and understanding in all future interactions with the model.

Via the system message, the model is very aware that the user has these preset labels and saved conversations. When contextually relevant, the model helps the user provide information that would help the model provide more value in subsequent interactions.

In the dropdown menu titled “Common Questions & Conversation Starters”:
- Great way to get users started to diminish the blank page/conversation problem.

### Tech Stack:
- Next.js 14 app router TypeScript
- Anthropic’s Claude API - Claude-3-Sonnet Model
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

The core “magic” of this application and the Anthropic API use all happens within `app/api/chat/pg-notes/route.ts`:
- I have 2 separate vector databases that I am using for RAG simultaneously:
  - `pg-chunks` index for the chunks of every essay.
  - `notes-gpt` index for all of the user's notes/saved conversations.
- When the user sends a new query, up to the last 10 messages in the current interaction get embedded.
- Using that recent messages embedding, query both Notes and Chunks index for similarity search on the vector embeddings.
- 5 most relevant notes and Chunks returned are contextually injected into the system message.

### System Message
- Lots of testing and iterating to get it to perform the way I wanted.
- Tried to adhere to the Claude Docs and best practices as best as possible.
- Split into 3 sections:
  - **Role**: Provides the overall context and high level understanding for the model.
  - **RAG Data injection**: both the Essay Snippets and User Notes.
  - **Instructions**: Bullet point format clear precise instructions for what to do and how to interact.

### Vercel AI SDK for easy streaming and integration back the frontend UI

## Frontend UI Chat Interface
Located at `app/(frontend)/chats/pg-notes/page.tsx`:
- Vercel AI SDK `useChat` hook.
- Dropdown menu from `kickStarters` array of questions and conversation starters.
- Whisper API Audio Transcription.
- Save Chat Functionality creates an editable note with the conversation.

## Notes Section
Located at `app/(frontend)/notes`:
- Create, Edit and Delete any notes.
- Can Use Whisper API audio transcription to create note contents.
- Backend Route for notes and creating embeddings `app/api/notes/route.ts`.
- Organize and Filter with Custom labels.
- Preset Labels to help the user provide contextually relevant information to enhance their experience.
- Chat History Label stores chats only if the user chooses.
- Doesn't get cluttered saving every chat, only when user manually saves.
- User can edit their saved conversations to make adjustments whenever needed.

## Scripts
- `scripts/scrape.ts`: Iterating through all essay links, scraping the content of each essay, splitting and chunking the content of each essay into about 300 tokens on average, storing the scraped data in `scripts/pg.json`.
- `scripts/embed.ts`: Embedding and storing each chunk into Pinecone Vector DB.
