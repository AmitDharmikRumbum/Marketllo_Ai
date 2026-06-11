import { NextRequest, NextResponse } from "next/server";
import { eazeQuery, eazeUpdate, toArray, mysqlDate } from "@/lib/eazemyapi";
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
  const result = await eazeQuery("get_ready_posts_for_cron");
  const posts = toArray<Record<string, string>>(result.data);

  if (posts.length === 0) {
    return NextResponse.json({ success: true, published: 0, message: "No posts due" });
  }

  console.log(`[cron/publish] ${posts.length} post(s) due`);

  const results: Array<{ postId: string; success: boolean; error?: string }> = [];

  for (const post of posts) {
    const postId          = String(post.id              ?? "");
    const platform        = String(post.platform        ?? "").toLowerCase();
    const productId       = String(post.product_id      ?? "");
    const platformRecordId = String(post.platform_record_id ?? "");
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

    // ── Fetch platform credentials (eazeShow doesn't work for product_platforms; use custom query) ──
    let accessToken = "";
    let memberId    = "";

    try {
      const platResult = await eazeQuery("get_product_platforms", { product_id: productId });
      const platforms  = toArray<Record<string, string>>(platResult.data);
      const platformRow = platforms.find((p) => String(p.id) === String(platformRecordId));

      if (!platformRow) {
        console.error(`[cron/publish] Platform record not found for post ${postId}`);
        results.push({ postId, success: false, error: "Platform record not found" });
        continue;
      }

      if (platformRow.status === "DISABLED") {
        console.log(`[cron/publish] Platform disabled — skipping post ${postId}`);
        results.push({ postId, success: false, error: "Platform disabled" });
        continue;
      }

      accessToken = platformRow.media_access_token ?? "";
      memberId    = platformRow.platform_user_id   ?? "";
    } catch (err) {
      console.error(`[cron/publish] Could not fetch platform creds for post ${postId}:`, err);
      results.push({ postId, success: false, error: "Failed to fetch platform credentials" });
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
