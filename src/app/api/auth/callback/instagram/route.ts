import { NextRequest, NextResponse } from "next/server";
import { eazeQueryPost, mysqlDate } from "@/lib/eazemyapi";
import { getSessionPayload } from "@/lib/auth";

const APP_ID       = process.env.META_APP_ID!;
const APP_SECRET   = process.env.META_APP_SECRET!;
const API_VERSION  = process.env.META_API_VERSION || "v25.0";
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:3000/api/auth/callback/instagram";
const GRAPH        = `https://graph.facebook.com/${API_VERSION}`;

// ── GET: Meta OAuth callback ──────────────────────────────────────────────────
// Meta redirects here with ?code=xxx&state=base64state
// Steps:
//   1. Exchange code → short-lived user token
//   2. Exchange short-lived → long-lived user token (60 days)
//   3. Get Facebook Pages the user manages
//   4. For each page, get the connected Instagram Business Account
//   5. Get a never-expiring Page Access Token for the IG account
//   6. Update product_platforms record via update_social_platform_status
//   7. Redirect back to onboarding Step 4
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // User denied permission
  if (error) {
    return NextResponse.redirect(new URL("/onboarding?resume=1&ig_error=denied", req.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/onboarding?resume=1&ig_error=missing_code", req.url));
  }

  // Decode state
  let platformRecordId: string;
  let priorityScore: string;
  let platform: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    platformRecordId = decoded.platformRecordId;
    priorityScore    = decoded.priorityScore || "0";
    platform         = decoded.platform || "instagram";
  } catch {
    return NextResponse.redirect(new URL("/onboarding?resume=1&ig_error=bad_state", req.url));
  }

  try {
    // ── Step 1: Exchange code → short-lived user token ─────────────────────
    const tokenRes = await fetch(
      `${GRAPH}/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("[ig-callback] token exchange error:", tokenData.error);
      return NextResponse.redirect(new URL("/onboarding?resume=1&ig_error=token_exchange", req.url));
    }

    const shortToken = tokenData.access_token;

    // ── Step 2: Exchange → long-lived user token (valid 60 days) ──────────
    const longTokenRes = await fetch(
      `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortToken}`
    );
    const longTokenData = await longTokenRes.json();
    const longToken = longTokenData.access_token || shortToken;

    // ── Step 3: Get Facebook Pages the user manages ──────────────────────
    const pagesRes = await fetch(`${GRAPH}/me/accounts?access_token=${longToken}`);
    const pagesData = await pagesRes.json();
    const pages: Array<{ id: string; access_token: string }> = pagesData.data || [];

    if (pages.length === 0) {
      console.error("[ig-callback] no Facebook Pages found");
      return NextResponse.redirect(new URL("/onboarding?resume=1&ig_error=no_pages", req.url));
    }

    // ── Step 4: Find page with connected Instagram Business Account ───────
    let igUserId: string | null = null;
    let igUsername: string | null = null;
    let pageAccessToken: string | null = null;

    for (const page of pages) {
      const igRes = await fetch(
        `${GRAPH}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      );
      const igData = await igRes.json();

      if (igData.instagram_business_account?.id) {
        igUserId = igData.instagram_business_account.id;
        pageAccessToken = page.access_token;

        const igUserRes = await fetch(
          `${GRAPH}/${igUserId}?fields=id,username,name&access_token=${page.access_token}`
        );
        const igUser = await igUserRes.json();
        igUsername = igUser.username || igUser.name || null;
        break;
      }
    }

    if (!igUserId || !pageAccessToken) {
      console.error("[ig-callback] no Instagram Business Account on any page");
      return NextResponse.redirect(new URL("/onboarding?resume=1&ig_error=no_ig_account", req.url));
    }

    // Page access tokens never expire
    const tokenExpiresAt = "2099-12-31 00:00:00";

    // ── Step 5: Update product_platforms record ───────────────────────────
    const updateResult = await eazeQueryPost("update_social_platform_status", {
      id:                 platformRecordId,
      platform:          platform,
      is_selected:       "1",
      priority_score:    priorityScore,
      status:            "CONNECTED",
      platform_user_id:  igUserId,
      platform_username: igUsername || "",
      token_expires_at:  tokenExpiresAt,
      media_access_token: pageAccessToken,
    });

    console.log("[ig-callback] platform updated:", JSON.stringify(updateResult));

    // ── Step 6: Redirect back to onboarding Step 4 with success ───────────
    return NextResponse.redirect(
      new URL(`/onboarding?resume=1&ig_connected=1&username=${encodeURIComponent(igUsername || "")}`, req.url)
    );
  } catch (err) {
    console.error("[ig-callback] unexpected error:", err);
    return NextResponse.redirect(new URL("/onboarding?resume=1&ig_error=server_error", req.url));
  }
}
