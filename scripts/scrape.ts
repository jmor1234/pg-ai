import axios from "axios"
import { load } from "cheerio";

const starterScrapeUrl = "https://paulgraham.com/articles.html";

const getEssayUrls = async () => {
    const html = await axios.get(starterScrapeUrl);
    const $ = load(html.data);
    const tables = $("table");
    const essaysArray: {essayExt: string, title: string}[] = [];
    tables.each((i, table) => {
        if (i === 2) {
            const links = $(table).find("a");
            links.each((i, link) => {
                const essayExt = $(link).attr("href");
                const title = $(link).text();
                if (essayExt && essayExt.endsWith(".html") && title) {
                    essaysArray.push({essayExt, title});
                }
            });
        }
    });
    return essaysArray;
}

const getEssay = async (essayExt: string) => {
    const html = await axios.get(`${starterScrapeUrl}/${essayExt}`)
    const $ = load(html.data)
    const tables = $("table")
    
}




const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    const essayUrls = [];
    for (const essayUrl of await getEssayUrls()) {
        essayUrls.push(essayUrl);
        console.log(essayUrl); // Log each essay as it gets added
        await delay(3000); // Wait for 3 seconds before processing the next URL
    }
    console.log(essayUrls);
})();