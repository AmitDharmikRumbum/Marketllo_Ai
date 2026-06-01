import Firecrawl from "@mendable/firecrawl-js";

export async function scrapeWebsite(url: string): Promise<string> {
  try {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY! });
    const result = await firecrawl.scrape(url, { formats: ["markdown"] });
    if (!result.markdown) return "";
    return result.markdown.slice(0, 4000);
  } catch {
    return "";
  }
}
