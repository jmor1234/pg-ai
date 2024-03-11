import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY! 
});

const index = pc.Index("pg-ai")

export default index;