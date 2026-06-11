import { NextRequest, NextResponse } from "next/server";
import { eazeQueryPost } from "@/lib/eazemyapi";

const CLIENT_ID    = process.env.LINKEDIN_CLIENT_ID!;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET!;
const REDIRECT_URI  = process.env.LINKEDIN_REDIRECT_URI || "http://localhost:3000/api/auth/callback/linkedin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/onboarding?resume=1&li_error=denied", req.url));
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL("/onboarding?resume=1&li_error=missing_code", req.url));
  }

  let platformRecordId: string;
  let priorityScore: string;
  let platform: string;
  try {
    const decoded    = JSON.parse(Buffer.from(state, "base64url").toString());
    platformRecordId = decoded.platformRecordId;
    priorityScore    = decoded.priorityScore || "0";
    platform         = decoded.platform || "linkedin";
  } catch {
    return NextResponse.redirect(new URL("/onboarding?resume=1&li_error=bad_state", req.url));
  }

  try {
    console.log("[li-callback] exchanging code for token, platformRecordId:", platformRecordId);

    // ── Step 1: Exchange code → access token ──────────────────────────────
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "authorization_code",
        code,
        redirect_uri:  REDIRECT_URI,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }).toString(),
    });
    const tokenData = await tokenRes.json();
    console.log("[li-callback] token response status:", tokenRes.status, "error:", tokenData.error);

    if (tokenData.error || !tokenData.access_token) {
      console.error("[li-callback] token exchange failed:", JSON.stringify(tokenData));
      return NextResponse.redirect(
        new URL(`/onboarding?resume=1&li_error=token_exchange&detail=${encodeURIComponent(tokenData.error_description || tokenData.error || "unknown")}`, req.url)
      );
    }

    const accessToken    = tokenData.access_token;
    const expiresIn      = tokenData.expires_in || 5184000;
    const expiresAt      = new Date(Date.now() + expiresIn * 1000);
    const tokenExpiresAt = expiresAt.toISOString().replace("T", " ").replace("Z", "").split(".")[0];

    // ── Step 2: Get LinkedIn member profile ───────────────────────────────
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();
    console.log("[li-callback] profile sub:", profile.sub, "name:", profile.name);

    const memberId   = profile.sub;
    const memberName = profile.name || profile.given_name || "LinkedIn User";

    if (!memberId) {
      console.error("[li-callback] no sub in profile:", JSON.stringify(profile));
      return NextResponse.redirect(new URL("/onboarding?resume=1&li_error=no_profile", req.url));
    }

    // ── Step 3: Update product_platforms record via custom query ──────────
    const updateResult = await eazeQueryPost("update_product_platforms", {
      id:                 platformRecordId,
      platform:           platform,
      is_selected:        "1",
      priority_score:     priorityScore,
      status:             "CONNECTED",
      platform_user_id:   memberId,
      platform_username:  memberName,
      token_expires_at:   tokenExpiresAt,
      media_access_token: accessToken,
    });
    console.log("[li-callback] update result:", JSON.stringify(updateResult));

    if (!updateResult?.success) {
      console.error("[li-callback] update failed:", JSON.stringify(updateResult));
      // Still mark as connected in redirect (OAuth worked) but log the issue
      // The token may not be persisted — log the message for debugging
      const msg = updateResult?.message || "update_failed";
      return NextResponse.redirect(
        new URL(`/onboarding?resume=1&li_error=update_failed&detail=${encodeURIComponent(msg)}`, req.url)
      );
    }

    return NextResponse.redirect(
      new URL(`/onboarding?resume=1&li_connected=1&username=${encodeURIComponent(memberName)}`, req.url)
    );
  } catch (err) {
    console.error("[li-callback] unexpected error:", err);
    return NextResponse.redirect(new URL("/onboarding?resume=1&li_error=server_error", req.url));
  }
}
