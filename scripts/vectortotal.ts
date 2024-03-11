import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config(); 

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const index = pc.Index("paulg-ai");

const getEmbeddingsCount = async () => {
  const stats = await index.describeIndexStats();
  console.log(`Total vectors stored: ${stats.totalRecordCount}`);
};

getEmbeddingsCount();
