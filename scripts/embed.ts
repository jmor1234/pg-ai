import dotenv from "dotenv";
dotenv.config(); // Add this line to load the environment variables
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PGEssay, PGJSON } from "@/types";
import fs from "fs";

const generateEmbeddings = async (essays: PGEssay[]) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const index = pc.Index("pg-chunks");

  console.log(`Starting to generate embeddings for ${essays.length} essays.`);
  for (let i = 0; i < essays.length; i++) {
    const essay = essays[i];
    console.log(`Processing essay ${i + 1}/${essays.length}: ${essay.title}`);

    for (let j = 0; j < essay.chunks.length; j++) {
      const chunk = essay.chunks[j];
      console.log(
        `\tGenerating embedding for chunk ${j + 1}/${
          essay.chunks.length
        } of essay '${essay.title}'`
      );

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk.content,
      });

      const embedding = embeddingResponse.data[0].embedding;
      console.log(
        `\t\tEmbedding generated with dimension: ${embedding.length}`
      );

      const pineconeData = {
        id: `${chunk.essay_title}-${chunk.essay_date}-${j}`,
        values: embedding,
        metadata: {
          essay_title: chunk.essay_title,
          essay_url: chunk.essay_url,
          essay_date: chunk.essay_date,
          content: chunk.content,
          content_tokens: chunk.content_tokens,
        },
      };
      try {
        // Wrap pineconeData in an array to match the expected type
        await index.upsert([pineconeData]);
        console.log(
          `\t\tEmbedding for chunk ${j + 1} of essay '${
            essay.title
          }' saved to Pinecone.`
        );
      } catch (error) {
        console.error(
          `\t\tError saving embedding for chunk ${j + 1} of essay '${
            essay.title
          }': ${error}`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 300)); // Rate limiting
    }
  }
  console.log("Completed generating and storing embeddings for all essays.");
};

(async () => {
  const json: PGJSON = JSON.parse(fs.readFileSync("scripts/pg.json", "utf8"));

  await generateEmbeddings(json.essays);
})();
