import { NextRequest, NextResponse } from "next/server";
import { eazeShow, eazeUpdate, mysqlDate } from "@/lib/eazemyapi";
import { getSessionPayload } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionPayload(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const postResult = await eazeShow("scheduled_posts", id);
  if (!postResult?.data) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  const post = Array.isArray(postResult.data) ? postResult.data[0] : postResult.data;

  const platform: string    = post?.platform     ?? "social media";
  const contentType: string = post?.content_type ?? "post";
  const originalText: string = post?.content_text ?? "";

  if (!originalText) {
    return NextResponse.json({ error: "No existing content to regenerate from" }, { status: 400 });
  }

  let newText = "";
  try {
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY! });
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      messages: [{
        role: "user",
        content: `You are an expert social media copywriter. Rewrite this ${platform} ${contentType} with a fresh angle, different wording, and stronger engagement hooks. Keep the same core topic and message but make it feel completely new.

Platform: ${platform}
Content type: ${contentType}
Original:
"${originalText}"

Return ONLY the rewritten post text. No explanations, no quotes, no labels.`,
      }],
    });
    newText = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
  } catch (err) {
    console.error("[regenerate-text] Claude failed:", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }

  if (!newText) {
    return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
  }

  try {
    await eazeUpdate("scheduled_posts", id, {
      content_text: newText,
      updated_at: mysqlDate(),
    });
  } catch (err) {
    console.error("[regenerate-text] DB update failed:", err);
  }

  return NextResponse.json({ success: true, content_text: newText });
}
