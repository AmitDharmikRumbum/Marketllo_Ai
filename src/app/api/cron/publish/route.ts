import { NextRequest, NextResponse } from "next/server";
import { eazeQuery, eazeUpdate, toArray, mysqlDate } from "@/lib/eazemyapi";
// Note: get-ready-posts already JOINs product_platforms so credentials come in one call
import { publishToLinkedIn } from "@/lib/linkedin-publish";

/**
 * GET /api/cron/publish
 *
 * Called by Vercel Cron every minute (see vercel.json).
 * Finds all READY posts whose scheduled_at <= NOW() on non-DISABLED platforms
 * and publishes each one.
 *
 * Secured by Authorization: Bearer CRON_SECRET (Vercel injects this automatically).
 */
export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.warn("[cron/publish] Unauthorized attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = req.nextUrl.origin;

  // ── Fetch posts due for publishing ────────────────────────────────────────
  const result = await eazeQuery("get-ready-posts");
  const posts = toArray<Record<string, string>>(result.data);

  if (posts.length === 0) {
    return NextResponse.json({ success: true, published: 0, message: "No posts due" });
  }

  console.log(`[cron/publish] ${posts.length} post(s) due`);

  const results: Array<{ postId: string; success: boolean; error?: string }> = [];

  for (const post of posts) {
    const postId          = String(post.id              ?? "");
    const platform        = String(post.platform        ?? "").toLowerCase();
    const contentText     = String(post.content_text    ?? "");
    let   contentImageUrl = String(post.content_image_url ?? "");

    if (!postId) continue;

    // Fix localhost image URLs — replace with current origin so Vercel can fetch them
    if (contentImageUrl.startsWith("http://localhost") || contentImageUrl.startsWith("https://localhost")) {
      try {
        const u = new URL(contentImageUrl);
        contentImageUrl = origin + u.pathname + u.search;
      } catch {
        contentImageUrl = "";
      }
    }

    // Only LinkedIn supported for now
    if (platform !== "linkedin") {
      console.log(`[cron/publish] Skipping post ${postId} — '${platform}' not yet supported`);
      results.push({ postId, success: false, error: `Platform '${platform}' not supported` });
      continue;
    }

    // ── Platform credentials come directly from the JOIN in get-ready-posts ──
    const accessToken    = String(post.media_access_token ?? "");
    const memberId       = String(post.platform_user_id   ?? "");
    const platformStatus = String(post.platform_status    ?? "");

    if (platformStatus === "DISABLED") {
      console.log(`[cron/publish] Platform disabled — skipping post ${postId}`);
      results.push({ postId, success: false, error: "Platform disabled" });
      continue;
    }

    if (!accessToken || !memberId) {
      console.error(`[cron/publish] Missing credentials for post ${postId}`);
      results.push({ postId, success: false, error: "Missing platform credentials" });
      continue;
    }

    // ── Publish ───────────────────────────────────────────────────────────────
    try {
      const publishResult = await publishToLinkedIn({
        contentText,
        contentImageUrl,
        accessToken,
        memberId,
        origin,
      });

      if (publishResult.success) {
        await eazeUpdate("scheduled_posts", postId, {
          status:           "PUBLISHED",
          platform_post_id: publishResult.linkedInPostId ?? "",
          published_at:     mysqlDate(),
        });
        console.log(`[cron/publish] Published post ${postId} → LinkedIn ID ${publishResult.linkedInPostId}`);
        results.push({ postId, success: true });
      } else {
        console.error(`[cron/publish] Failed post ${postId}:`, publishResult.error);
        results.push({ postId, success: false, error: publishResult.error });
      }
    } catch (err) {
      console.error(`[cron/publish] Unexpected error for post ${postId}:`, err);
      results.push({ postId, success: false, error: String(err) });
    }
  }

  const published = results.filter((r) => r.success).length;
  const failed    = results.filter((r) => !r.success).length;

  console.log(`[cron/publish] Done — ${published} published, ${failed} failed`);

  return NextResponse.json({ success: true, published, failed, results });
}
