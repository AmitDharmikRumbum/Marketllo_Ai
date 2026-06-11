import * as cheerio from "cheerio";

export interface StoreData {
  name: string;
  developer: string;
  description: string;
  category: string;
  rating: string;
  reviews: string;
  platform: "ios" | "android" | "unknown";
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  Accept: "text/html,application/xhtml+xml",
};

/**
 * Detect which store the URL belongs to.
 */
export function detectStore(url: string): "ios" | "android" | "unknown" {
  if (!url) return "unknown";
  if (url.includes("apps.apple.com") || url.includes("itunes.apple.com")) return "ios";
  if (url.includes("play.google.com")) return "android";
  return "unknown";
}

/**
 * Scrape App Store (iOS) page metadata.
 */
async function scrapeAppStore(url: string): Promise<StoreData> {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const name =
      $("h1.product-header__title").text().trim() ||
      $("title").text().split(" on the App Store")[0].trim();

    const developer =
      $(".product-header__identity a").text().trim() ||
      $('meta[name="author"]').attr("content")?.trim() || "";

    const description =
      $(".section__description p").first().text().trim() ||
      $('meta[name="description"]').attr("content")?.trim() || "";

    const category =
      $(".link.badge-link").first().text().trim() || "";

    const rating =
      $(".we-rating-count").text().trim() || "";

    return { name, developer, description: description.slice(0, 800), category, rating, reviews: "", platform: "ios" };
  } catch {
    return { name: "", developer: "", description: "", category: "", rating: "", reviews: "", platform: "ios" };
  }
}

/**
 * Scrape Google Play Store page metadata.
 */
async function scrapePlayStore(url: string): Promise<StoreData> {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const name =
      $("h1").first().text().trim() ||
      $('[itemprop="name"]').first().text().trim() || "";

    const developer =
      $('[href*="developer"]').first().text().trim() ||
      $('[itemprop="author"]').first().text().trim() || "";

    const description =
      $('[data-g-id="description"]').text().trim() ||
      $('meta[name="description"]').attr("content")?.trim() || "";

    const rating =
      $('[itemprop="ratingValue"]').attr("content") ||
      $('[itemprop="ratingValue"]').text().trim() || "";

    const reviews =
      $('[itemprop="ratingCount"]').attr("content") ||
      $('[itemprop="ratingCount"]').text().trim() || "";

    const category =
      $('[itemprop="genre"]').text().trim() ||
      $('a[href*="category"]').first().text().trim() || "";

    return { name, developer, description: description.slice(0, 800), category, rating, reviews, platform: "android" };
  } catch {
    return { name: "", developer: "", description: "", category: "", rating: "", reviews: "", platform: "android" };
  }
}

/**
 * Scrape the app store URL (auto-detect iOS / Android).
 * Returns null if URL is not a recognised store.
 */
export async function scrapeStore(url: string): Promise<StoreData | null> {
  const platform = detectStore(url);
  if (platform === "ios") return scrapeAppStore(url);
  if (platform === "android") return scrapePlayStore(url);
  return null;
}

/**
 * Format StoreData into a plain-text summary for the prompt.
 */
export function formatStoreData(store: StoreData): string {
  const lines: string[] = [];
  if (store.name) lines.push(`App Name: ${store.name}`);
  if (store.developer) lines.push(`Developer: ${store.developer}`);
  if (store.category) lines.push(`Category: ${store.category}`);
  if (store.rating) lines.push(`Rating: ${store.rating}`);
  if (store.reviews) lines.push(`Reviews: ${store.reviews}`);
  if (store.description) lines.push(`Description:\n${store.description}`);
  return lines.join("\n");
}
