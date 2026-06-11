import { chromium } from "playwright";

export interface StoreData {
  name: string;
  developer: string;
  description: string;
  category: string;
  rating: string;
  reviews: string;
  platform: "ios" | "android" | "unknown";
}

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
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.waitForTimeout(1500);

    const data = await page.evaluate(() => {
      const getText = (sel: string) =>
        (document.querySelector(sel) as HTMLElement)?.innerText?.trim() ?? "";
      const getMeta = (name: string) =>
        document.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ?? "";

      return {
        name:
          getText("h1.product-header__title") ||
          getText('[class*="product-header__title"]') ||
          document.title.split(" on the App Store")[0].trim(),
        developer:
          getText(".product-header__identity a") ||
          getText('[class*="product-header__identity"]'),
        description:
          getText(".section__description p") ||
          getText('[class*="truncate-with-fade"]') ||
          getMeta("description"),
        category:
          getText(".link.badge-link") ||
          getText('[class*="badge-link"]') ||
          "",
        rating: getText(".we-rating-count") || getText('[class*="we-rating-count"]') || "",
        reviews: "",
      };
    });

    return { ...data, platform: "ios" };
  } catch {
    return { name: "", developer: "", description: "", category: "", rating: "", reviews: "", platform: "ios" };
  } finally {
    await browser?.close();
  }
}

/**
 * Scrape Google Play Store page metadata.
 */
async function scrapePlayStore(url: string): Promise<StoreData> {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.waitForTimeout(2000);

    const data = await page.evaluate(() => {
      const getText = (sel: string) =>
        (document.querySelector(sel) as HTMLElement)?.innerText?.trim() ?? "";

      // Play Store uses dynamic classes — use itemprop / aria
      const name =
        document.querySelector("h1")?.textContent?.trim() ||
        document.querySelector('[itemprop="name"]')?.textContent?.trim() ||
        "";

      const developer =
        document.querySelector('[href*="developer"]')?.textContent?.trim() ||
        document.querySelector('[itemprop="author"]')?.textContent?.trim() ||
        "";

      const description =
        document.querySelector('[data-g-id="description"]')?.textContent?.trim() ||
        getText('[jsname="sngebd"]') ||
        document.querySelector('meta[name="description"]')?.getAttribute("content") ||
        "";

      const ratingEl = document.querySelector('[itemprop="ratingValue"]');
      const rating = ratingEl?.getAttribute("content") || ratingEl?.textContent?.trim() || "";

      const reviewsEl = document.querySelector('[itemprop="ratingCount"]');
      const reviews = reviewsEl?.getAttribute("content") || reviewsEl?.textContent?.trim() || "";

      const category =
        document.querySelector('[itemprop="genre"]')?.textContent?.trim() ||
        document.querySelector('a[href*="category"]')?.textContent?.trim() ||
        "";

      return { name, developer, description: description.slice(0, 800), category, rating, reviews };
    });

    return { ...data, platform: "android" };
  } catch {
    return { name: "", developer: "", description: "", category: "", rating: "", reviews: "", platform: "android" };
  } finally {
    await browser?.close();
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
