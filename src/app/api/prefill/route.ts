import { NextRequest, NextResponse } from "next/server";
import { scrapeWebsite } from "@/lib/scraper";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  try {
    const { websiteUrl } = await req.json();
    if (!websiteUrl) return NextResponse.json({ error: "websiteUrl required" }, { status: 400 });

    const websiteContent = await scrapeWebsite(websiteUrl);
    if (!websiteContent) return NextResponse.json({ description: "" });

    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY! });
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Extract a 2-3 sentence product description from this website content. Write it in plain English describing what the product does, who it's for, and what makes it unique. Return ONLY the description text, nothing else.

WEBSITE CONTENT:
${websiteContent.slice(0, 2000)}`,
        },
      ],
    });

    const description = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    return NextResponse.json({ description });
  } catch {
    return NextResponse.json({ description: "" });
  }
}
