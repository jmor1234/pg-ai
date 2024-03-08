import { PGChunk, PGEssay, PGJSON } from '@/types';
import axios from 'axios';
import { load } from 'cheerio';
import { encode } from 'gpt-3-encoder';
import fs from "fs";

const BASE_URL = "http://paulgraham.com";
const CHUNK_SIZE = 300;

const getLinks = async () => {
 const html = await axios.get(`${BASE_URL}/articles.html`);
 // Use the load function to parse the HTML content
 const $ = load(html.data);

 const tables = $("table");

 const linkArr: { url: string, title: string }[] = [];

 tables.each((i, table) => {
    if(i === 2) {
      const links = $(table).find("a");
      links.each((i, link) => {
        const url = $(link).attr('href');
        const title = $(link).text();

        if(url && url.endsWith(".html") && title) {
          const linkObj = {
            url,
            title
          };

          linkArr.push(linkObj);
        }
      });
    }
 });

 return linkArr;
};

const getEssay = async (url: string, title: string) => {
 let essay: PGEssay = {
    title: "",
    url: "",
    date: "",
    content: "",
    tokens: 0,
    chunks: []
 };

 const html = await axios.get(`${BASE_URL}/${url}`);
 // Use the load function to parse the HTML content
 const $ = load(html.data);
 const tables = $("table");

 tables.each((i, table) => {
    if(i === 1) {
      const text = $(table).text();

      let cleanedText = text.replace(/\s+/g, " ").replace(/\.([a-zA-z])/g, ". $1");

      const split = cleanedText.match(/([A-Z][a-z]+ [0-9]{4})/);
      let dateStr = "";
      let textWithoutDate = "";

      if(split) {
        dateStr = split[0];
        textWithoutDate = cleanedText.replace(dateStr, "");
      }

      let essayText = textWithoutDate.replace(/\n/g, " ").trim();

      essay = {
        title,
        url: `${BASE_URL}/${url}`,
        date: dateStr,
        content: essayText,
        tokens: encode(essayText).length,
        chunks: []
      };
    }
 });
 return essay;
};

const getChunks = async (essay: PGEssay) => {
 const {title, url, date, content} = essay;

 let essayTextChunks: string[] = [];

 if(encode(content).length > CHUNK_SIZE) {
    const split = content.split(". ");
    let chunkText = "";

    for(let i =0; i < split.length; i++) {
      const sentence = split[i];
      const sentenceTokenLength = encode(sentence).length;
      const chunkTextTokenLength = encode(chunkText).length;

      if(chunkTextTokenLength + sentenceTokenLength > CHUNK_SIZE) {
        essayTextChunks.push(chunkText);
        chunkText= "";
      }

      if(sentence[sentence.length -1].match(/[a-z0-9]/i)) {
        chunkText += sentence + ". ";
      } else {
        chunkText += sentence + " ";
      }
    } 
    essayTextChunks.push(chunkText.trim());
    
 } else {
    essayTextChunks.push(content.trim());
 }

 const essayChunks: PGChunk[] = essayTextChunks.map((chunkText, i) => {
    const chunk: PGChunk = {
      essay_title: title,
      essay_url: url,
      essay_date: date,
      content: chunkText,
      content_tokens: encode(chunkText).length,
      embedding: []
    };
    return chunk;
 });

 if(essayChunks.length > 1) {
    for(let i=0; i < essayChunks.length; i++) {
      const chunk = essayChunks[i];
      const prevChunk = essayChunks[i - 1];

      if(chunk.content_tokens < 100 && prevChunk) {
        prevChunk.content += " " + chunk.content;
        prevChunk.content_tokens = encode(prevChunk.content).length;
        essayChunks.splice(i, 1);
      }
    }
 }

 const chunkedEssay: PGEssay = {
    ...essay,
    chunks: essayChunks
 };

 return chunkedEssay;
};

(async () => {
 const links = await getLinks();

 console.log(`Found ${links.length} links to process.`);

 let essays: PGEssay[] = [];

 for (let i=0; i < links.length; i++) {
      const link = links[i];
      console.log(`Processing ${i + 1}/${links.length}: ${link.title}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Added to ensure a delay of 2 seconds before each request
      const essay = await getEssay(link.url, link.title);
      const chunkedEssay = await getChunks(essay);
      essays.push(chunkedEssay);
 }

 console.log("Scraping complete. Writing data to file...");

 const json: PGJSON = {
    tokens: essays.reduce((acc, essay) => acc + essay.tokens, 0),
    essays
 };
 fs.writeFileSync("scripts/pg.json", JSON.stringify(json));

 console.log("Data written to scripts/pg.json successfully.");
})();
