import { chromium } from "playwright";

/**
 * Scrape a website using Playwright (headless Chromium).
 * Returns cleaned text content up to 4000 chars.
 */
export async function scrapeWebsite(url: string): Promise<string> {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20_000 });
    // Wait a bit for JS-rendered content
    await page.waitForTimeout(1500);

    // Extract meaningful text: headings, paragraphs, lists, meta description
    const content = await page.evaluate(() => {
      // Meta description
      const metaDesc =
        document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";

      // Main content areas (prefer main/article, fall back to body)
      const root =
        document.querySelector("main") ??
        document.querySelector("article") ??
        document.body;

      const textNodes: string[] = [];

      // Title
      if (document.title) textNodes.push(`Title: ${document.title}`);
      if (metaDesc) textNodes.push(`Meta: ${metaDesc}`);

      // Collect text from visible elements
      const tags = root.querySelectorAll("h1,h2,h3,h4,p,li,span,div");
      const seen = new Set<string>();

      tags.forEach((el) => {
        const text = (el as HTMLElement).innerText?.trim();
        if (!text || text.length < 10 || seen.has(text)) return;
        // Skip elements with many nested children (likely containers)
        if (el.children.length > 5) return;
        seen.add(text);
        textNodes.push(text);
      });

      return textNodes.join("\n");
    });

    return content.slice(0, 5000);
  } catch {
    return "";
  } finally {
    await browser?.close();
  }
}
