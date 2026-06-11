import { NextRequest, NextResponse } from "next/server";
import { eazeQueryPost } from "@/lib/eazemyapi";
import { getSessionPayload } from "@/lib/auth";
import { mysqlDate } from "@/lib/eazemyapi";

const META_VERSION = process.env.META_API_VERSION || "v25.0";
const IG_USER_ID   = process.env.IG_USER_ID!;
const IG_TOKEN     = process.env.IG_ACCESS_TOKEN!;
const IG_USERNAME  = process.env.IG_USERNAME || "taskllo";

// ── POST: Connect Instagram for a product_platforms record ───────────────────
// Body: { platformRecordId, platform, priorityScore }
export async function POST(req: NextRequest) {
  try {
    const session = getSessionPayload(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platformRecordId, platform, priorityScore } = await req.json();

    if (!platformRecordId) {
      return NextResponse.json({ error: "platformRecordId is required" }, { status: 400 });
    }

    // Verify token is still valid via Meta API
    const verifyRes = await fetch(
      `https://graph.facebook.com/${META_VERSION}/${IG_USER_ID}?fields=id,username,name&access_token=${IG_TOKEN}`
    );
    const igUser = await verifyRes.json();

    if (igUser.error) {
      console.error("[connect-instagram] token invalid:", igUser.error);
      return NextResponse.json({ error: "Instagram token is invalid or expired." }, { status: 400 });
    }

    // token_expires_at: expires_at=0 means never expires — store far future date
    const tokenExpiresAt = "2099-12-31 00:00:00";

    // Update product_platforms record with token info + CONNECTED status
    const updateResult = await eazeQueryPost("update_social_platform_status", {
      id:                 platformRecordId,
      platform:          platform || "instagram",
      is_selected:       "1",
      priority_score:    String(priorityScore || "0"),
      status:            "CONNECTED",
      platform_user_id:  String(igUser.id || IG_USER_ID),
      platform_username: igUser.username || IG_USERNAME,
      token_expires_at:  tokenExpiresAt,
      media_access_token: IG_TOKEN,
    }, session.eazeToken);

    console.log("[connect-instagram] update result:", JSON.stringify(updateResult));

    return NextResponse.json({
      success: true,
      username: igUser.username || IG_USERNAME,
      userId: igUser.id || IG_USER_ID,
    });
  } catch (err) {
    console.error("[connect-instagram] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
