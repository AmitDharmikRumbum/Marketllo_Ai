import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth";
import { eazeShow, eazeUpdate, eazeQuery, toArray, mysqlDate } from "@/lib/eazemyapi";
import { publishToLinkedIn } from "@/lib/linkedin-publish";

export async function POST(req: NextRequest) {
  const session = getSessionPayload(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { postId } = body as { postId: string };

  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  // ── Fetch scheduled_post ──────────────────────────────────────────────────
  const postResult = await eazeShow("scheduled_posts", postId);
  if (!postResult?.data) {
    return NextResponse.json({ error: "Scheduled post not found" }, { status: 404 });
  }
  const post = Array.isArray(postResult.data) ? postResult.data[0] : postResult.data;

  const platform: string         = post?.platform          ?? "";
  const contentText: string      = post?.content_text      ?? "";
  const contentImageUrl: string  = post?.content_image_url ?? "";
  const platformRecordId: string = post?.platform_record_id ?? "";

  if (!platformRecordId) {
    return NextResponse.json({ error: "No platform_record_id on this post" }, { status: 400 });
  }

  // ── Fetch platform credentials via custom query ───────────────────────────
  const productId: string = post?.product_id ?? "";
  if (!productId) {
    return NextResponse.json({ error: "No product_id on this post" }, { status: 400 });
  }

  const platformsResult = await eazeQuery("get_product_platforms", { product_id: productId });
  const allPlatforms = toArray<Record<string, string>>(platformsResult.data);
  const platformRow = allPlatforms.find((p) => String(p.id) === String(platformRecordId));

  if (!platformRow) {
    console.error("[publish-now] platform not found. platformRecordId:", platformRecordId, "available:", allPlatforms.map(p => p.id));
    return NextResponse.json({ error: "Platform record not found" }, { status: 404 });
  }

  const accessToken: string = platformRow?.media_access_token ?? "";
  const memberId: string    = platformRow?.platform_user_id   ?? "";

  if (!accessToken || !memberId) {
    return NextResponse.json({ error: "Missing LinkedIn credentials on platform record" }, { status: 400 });
  }

  const platformStatus: string = platformRow?.status ?? "";
  if (platformStatus === "DISABLED") {
    return NextResponse.json({ error: "This platform is disabled. Enable it before publishing." }, { status: 403 });
  }

  // ── Publish ───────────────────────────────────────────────────────────────
  if (platform.toLowerCase() !== "linkedin") {
    return NextResponse.json({ error: `Platform '${platform}' is not yet supported for publish-now` }, { status: 400 });
  }

  const result = await publishToLinkedIn({
    contentText,
    contentImageUrl,
    accessToken,
    memberId,
    origin: req.nextUrl.origin,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "LinkedIn API error" }, { status: 500 });
  }

  // ── Update post status ────────────────────────────────────────────────────
  try {
    await eazeUpdate("scheduled_posts", postId, {
      status:           "PUBLISHED",
      platform_post_id: result.linkedInPostId,
      published_at:     mysqlDate(),
    });
  } catch (err) {
    console.error("[publish-now] failed to update post status:", err);
  }

  return NextResponse.json({ success: true, postId: result.linkedInPostId });
}
