import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth";
import { eazeShow, eazeUpdate } from "@/lib/eazemyapi";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const session = getSessionPayload(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await req.json() as { postId: string };
  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  // ── Fetch the post ──────────────────────────────────────────────────────────
  const postResult = await eazeShow("scheduled_posts", postId);
  if (!postResult?.data) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  const post         = Array.isArray(postResult.data) ? postResult.data[0] : postResult.data;
  const contentText: string  = post?.content_text  ?? "";
  const platform: string     = post?.platform      ?? "social media";
  const contentType: string  = post?.content_type  ?? "post";

  // ── Step 1: Use Claude Haiku to write a great image prompt ─────────────────
  let imagePrompt = "";
  try {
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY! });
    const msg = await anthropic.messages.create({
      model:      "claude-haiku-4-5",
      max_tokens: 150,
      messages: [{
        role:    "user",
        content: `Write a concise Pollinations AI image prompt (max 20 words) for a ${platform} ${contentType} image.
The post is about: "${contentText.slice(0, 200)}"
Requirements: professional, visually striking, no text in image, suitable for ${platform}.
Return ONLY the prompt, nothing else.`,
      }],
    });
    imagePrompt = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
  } catch (err) {
    console.error("[generate-image] Claude prompt generation failed:", err);
  }

  // Fallback prompt if Claude fails
  if (!imagePrompt) {
    imagePrompt = `professional ${platform} marketing image, modern design, vibrant colors`;
  }

  // ── Step 2: Build Pollinations AI URL and pre-fetch to confirm it's ready ────
  const seed            = Math.floor(Math.random() * 999999);
  const encoded         = encodeURIComponent(imagePrompt);
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1200&height=630&nologo=true&seed=${seed}&enhance=true`;

  const base = req.nextUrl.origin;
  let imageUrl = `/api/og/${postId}`; // fallback to branded OG card (relative)

  console.log("[generate-image] Pollinations prompt:", imagePrompt);

  try {
    // Pre-fetch with 45s timeout — waits for Pollinations to actually generate the image
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 45_000);

    const imgRes = await fetch(pollinationsUrl, {
      redirect: "follow",
      signal:   controller.signal,
    });
    clearTimeout(timeout);

    if (imgRes.ok) {
      // Image is ready — save the proxy URL (browser will load it instantly from cache)
      imageUrl = `/api/image-proxy?url=${encodeURIComponent(pollinationsUrl)}`;
      console.log("[generate-image] Pollinations image ready, proxy URL saved");
    } else {
      console.warn(`[generate-image] Pollinations returned ${imgRes.status}, falling back to OG image`);
    }
  } catch (err) {
    console.warn("[generate-image] Pollinations fetch failed/timed out, falling back to OG image:", err);
  }

  // ── Step 3: Save image URL to scheduled_posts (CRUD update — only touches content_image_url) ──
  try {
    const { mysqlDate } = await import("@/lib/eazemyapi");
    await eazeUpdate("scheduled_posts", postId, {
      content_image_url: imageUrl,
      updated_at: mysqlDate(),
    });
  } catch (err) {
    console.error("[generate-image] failed to save image URL:", err);
  }

  return NextResponse.json({ success: true, imageUrl });
}
