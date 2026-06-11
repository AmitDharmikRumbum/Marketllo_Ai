import { NextRequest, NextResponse } from "next/server";
import { eazeQueryPost } from "@/lib/eazemyapi";

const APP_ID       = process.env.META_APP_ID!;
const APP_SECRET   = process.env.META_APP_SECRET!;
const API_VERSION  = process.env.META_API_VERSION || "v25.0";
const REDIRECT_URI = process.env.FB_REDIRECT_URI || "http://localhost:3000/api/auth/callback/facebook";
const GRAPH        = `https://graph.facebook.com/${API_VERSION}`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/onboarding?resume=1&fb_error=denied", req.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/onboarding?resume=1&fb_error=missing_code", req.url));
  }

  let platformRecordId: string;
  let priorityScore: string;
  let platform: string;
  try {
    const decoded    = JSON.parse(Buffer.from(state, "base64url").toString());
    platformRecordId = decoded.platformRecordId;
    priorityScore    = decoded.priorityScore || "0";
    platform         = decoded.platform || "facebook";
  } catch {
    return NextResponse.redirect(new URL("/onboarding?resume=1&fb_error=bad_state", req.url));
  }

  try {
    // ── Step 1: Exchange code → short-lived token ──────────────────────────
    const tokenRes = await fetch(
      `${GRAPH}/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("[fb-callback] token error:", tokenData.error);
      return NextResponse.redirect(new URL("/onboarding?resume=1&fb_error=token_exchange", req.url));
    }

    // ── Step 2: Exchange → long-lived user token ───────────────────────────
    const longTokenRes = await fetch(
      `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${tokenData.access_token}`
    );
    const longTokenData = await longTokenRes.json();
    const longToken = longTokenData.access_token || tokenData.access_token;

    // ── Step 3: Get Facebook Pages this user manages ───────────────────────
    const pagesRes = await fetch(`${GRAPH}/me/accounts?access_token=${longToken}`);
    const pagesData = await pagesRes.json();
    const pages: Array<{ id: string; name: string; access_token: string }> = pagesData.data || [];

    if (pages.length === 0) {
      console.error("[fb-callback] no pages found");
      return NextResponse.redirect(new URL("/onboarding?resume=1&fb_error=no_pages", req.url));
    }

    // Use first page (user can change in settings later)
    const page = pages[0];

    // ── Step 4: Update product_platforms record ────────────────────────────
    await eazeQueryPost("update_social_platform_status", {
      id:                 platformRecordId,
      platform:          platform,
      is_selected:       "1",
      priority_score:    priorityScore,
      status:            "CONNECTED",
      platform_user_id:  page.id,
      platform_username: page.name,
      token_expires_at:  "2099-12-31 00:00:00", // page tokens never expire
      media_access_token: page.access_token,
    });

    return NextResponse.redirect(
      new URL(`/onboarding?resume=1&fb_connected=1&username=${encodeURIComponent(page.name)}`, req.url)
    );
  } catch (err) {
    console.error("[fb-callback] error:", err);
    return NextResponse.redirect(new URL("/onboarding?resume=1&fb_error=server_error", req.url));
  }
}
