import { NextRequest, NextResponse } from "next/server";
import { eazeQuery, eazeUpdate, toArray, mysqlDate } from "@/lib/eazemyapi";
import { publishToLinkedIn } from "@/lib/linkedin-publish";

/**
 * GET /api/cron/publish
 *
 * Called by Vercel Cron on schedule (see vercel.json).
 * Finds all READY posts whose scheduled_at is <= NOW() on non-DISABLED platforms
 * and publishes each one to the appropriate social platform.
 *
 * Secured by Authorization: Bearer CRON_SECRET header (Vercel injects this automatically).
 */
export async function GET(req: NextRequest) {
  // ── Auth: verify cron secret ──────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.warn("[cron/publish] Unauthorized attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = req.nextUrl.origin;

  // ── Fetch all posts due for publishing ────────────────────────────────────
  const result = await eazeQuery("get_ready_posts_for_cron");
  const posts = toArray<Record<string, string>>(result.data);

  if (posts.length === 0) {
    return NextResponse.json({ success: true, published: 0, message: "No posts due" });
  }

  console.log(`[cron/publish] Found ${posts.length} post(s) due for publishing`);

  const results: Array<{ postId: string; success: boolean; error?: string }> = [];

  for (const post of posts) {
    const postId          = String(post.id             ?? "");
    const platform        = String(post.platform       ?? "").toLowerCase();
    const contentText     = String(post.content_text   ?? "");
    const contentImageUrl = String(post.content_image_url ?? "");
    const accessToken     = String(post.media_access_token ?? "");
    const memberId        = String(post.platform_user_id   ?? "");

    if (!postId) continue;

    // Only LinkedIn is supported for now
    if (platform !== "linkedin") {
      console.log(`[cron/publish] Skipping post ${postId} — platform '${platform}' not yet supported`);
      results.push({ postId, success: false, error: `Platform '${platform}' not supported` });
      continue;
    }

    if (!accessToken || !memberId) {
      console.error(`[cron/publish] Missing credentials for post ${postId}`);
      results.push({ postId, success: false, error: "Missing platform credentials" });
      continue;
    }

    try {
      const publishResult = await publishToLinkedIn({
        contentText,
        contentImageUrl,
        accessToken,
        memberId,
        origin,
      });

      if (publishResult.success) {
        // Mark as PUBLISHED in DB
        await eazeUpdate("scheduled_posts", postId, {
          status:           "PUBLISHED",
          platform_post_id: publishResult.linkedInPostId ?? "",
          published_at:     mysqlDate(),
        });
        console.log(`[cron/publish] Published post ${postId} → LinkedIn ID ${publishResult.linkedInPostId}`);
        results.push({ postId, success: true });
      } else {
        console.error(`[cron/publish] Failed to publish post ${postId}:`, publishResult.error);
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

  return NextResponse.json({
    success: true,
    published,
    failed,
    results,
  });
}
