import { NextRequest, NextResponse } from "next/server";
import { scrapeWebsite } from "@/lib/scraper";
import { analyzeProduct } from "@/lib/claude";
import { getTrendingKeywords } from "@/lib/serpapi";

export async function POST(req: NextRequest) {
  try {
    const { websiteUrl, description } = await req.json();

    if (!websiteUrl || !description) {
      return NextResponse.json({ error: "websiteUrl and description are required" }, { status: 400 });
    }

    // Scrape website and fetch trending data in parallel
    const [websiteContent, trending] = await Promise.all([
      scrapeWebsite(websiteUrl),
      getTrendingKeywords(description.slice(0, 100)),
    ]);

    // Analyze with Claude (trending data enriches platform + content recommendations)
    const analysis = await analyzeProduct(websiteUrl, description, websiteContent, trending);

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please check your product details and try again." },
      { status: 500 }
    );
  }
}
