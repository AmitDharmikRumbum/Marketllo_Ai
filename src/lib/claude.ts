import Anthropic from "@anthropic-ai/sdk";
import type { TrendingData } from "@/lib/serpapi";

function getClient() {
  return new Anthropic({ apiKey: process.env.CLAUDE_API_KEY! });
}

export interface ProductAnalysis {
  productName: string;
  category: string;
  categoryMatch: number;
  otherCategories: string[];
  tagline: string;
  audience: {
    title: string;
    description: string;
    companySize: string;
    roles: string;
    industry: string;
    location: string;
  };
  platforms: {
    name: string;
    platform: string;
    score: number;
    reason: string;
  }[];
  contentStyle: {
    name: string;
    description: string;
    tags: string[];
    pillars: string[];
  };
  postIdeas: string[];
}

export async function analyzeProduct(
  websiteUrl: string,
  description: string,
  websiteContent: string,
  trending?: TrendingData
): Promise<ProductAnalysis> {
  const trendingSection = trending && (trending.keywords.length > 0 || trending.relatedTopics.length > 0)
    ? `\nTRENDING DATA (Google Trends — use to inform post ideas and content pillars):
Rising searches: ${trending.keywords.join(", ") || "none"}
Top searches: ${trending.relatedTopics.join(", ") || "none"}\n`
    : "";

  const prompt = `You are an expert marketing strategist and social media consultant. Analyze this product/startup and return a detailed marketing analysis.

PRODUCT INFO:
Website: ${websiteUrl}
User hint (may be vague): ${description}
${trendingSection}
WEBSITE CONTENT (primary source — extract the real product name, description, and value proposition from this):
${websiteContent || "Not available — use the user hint only."}

Instructions: Use the website content as the primary source of truth for what this product does. The user hint is supplementary — it may be incomplete or vague. Extract the actual product name, tagline, and description from the website content whenever available.

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "productName": "product name extracted from the website",
  "category": "primary product category (e.g. Project Management, E-commerce, FinTech, EdTech, etc.)",
  "categoryMatch": 92,
  "otherCategories": ["Secondary Category", "Tertiary Category"],
  "tagline": "one-line value proposition extracted from the website",
  "audience": {
    "title": "Target Audience Title (e.g. Small to Medium Teams)",
    "description": "1-2 sentence description of who this is for",
    "companySize": "e.g. 2 – 50 employees",
    "roles": "e.g. Founders, Product Managers, Developers",
    "industry": "e.g. SaaS, Marketing, Design",
    "location": "e.g. Global (English speaking)"
  },
  "platforms": [
    { "name": "Instagram", "platform": "instagram", "score": 92, "reason": "why this platform fits" },
    { "name": "LinkedIn", "platform": "linkedin", "score": 88, "reason": "why" },
    { "name": "X (Twitter)", "platform": "twitter", "score": 76, "reason": "why" },
    { "name": "YouTube", "platform": "youtube", "score": 54, "reason": "why" },
    { "name": "TikTok", "platform": "tiktok", "score": 48, "reason": "why" },
    { "name": "Facebook", "platform": "facebook", "score": 32, "reason": "why" }
  ],
  "contentStyle": {
    "name": "Content Style Name (e.g. Educational + Value Driven)",
    "description": "Why this content style fits the audience",
    "tags": ["Tag1", "Tag2", "Tag3"],
    "pillars": ["Pillar 1", "Pillar 2", "Pillar 3", "Pillar 4"]
  },
  "postIdeas": [
    "Post idea 1 — incorporate trending topics if relevant",
    "Post idea 2",
    "Post idea 3"
  ]
}

Be specific and accurate. Base everything on the actual product, not generic advice. Platform scores must be realistic (Instagram/LinkedIn tend to be high for B2B SaaS, TikTok lower). If trending data is provided, use it to make post ideas and content pillars more timely and relevant.`;

  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Strip any markdown code fences if Claude adds them
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as ProductAnalysis;
}
