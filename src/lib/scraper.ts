import * as cheerio from "cheerio";

/**
 * Scrape a website using fetch + cheerio (works on Vercel serverless).
 * Returns cleaned text content up to 5000 chars.
 */
export async function scrapeWebsite(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return "";

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove noise
    $("script, style, nav, footer, header, noscript, iframe, svg").remove();

    const textNodes: string[] = [];

    // Title
    const title = $("title").text().trim();
    if (title) textNodes.push(`Title: ${title}`);

    // Meta description
    const metaDesc = $('meta[name="description"]').attr("content")?.trim();
    if (metaDesc) textNodes.push(`Meta: ${metaDesc}`);

    // Main content
    const root = $("main, article, [role='main']").first();
    const target = root.length ? root : $("body");

    const seen = new Set<string>();
    target.find("h1,h2,h3,h4,p,li").each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, " ");
      if (!text || text.length < 10 || seen.has(text)) return;
      seen.add(text);
      textNodes.push(text);
    });

    return textNodes.join("\n").slice(0, 5000);
  } catch {
    return "";
  }
}
