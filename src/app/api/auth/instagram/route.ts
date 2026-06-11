import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth";

const APP_ID       = process.env.META_APP_ID!;
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:3000/api/auth/callback/instagram";

const SCOPES = [
  "instagram_basic",
  "instagram_content_publish",
  "instagram_manage_comments",
  "instagram_manage_insights",
  "pages_show_list",
  "pages_read_engagement",
].join(",");

// ── GET: Start Instagram OAuth flow ──────────────────────────────────────────
// Query params: platformRecordId, priorityScore, platform
// Redirects to instagram.com/oauth/authorize — shows Instagram login, not Facebook
export async function GET(req: NextRequest) {
  const session = getSessionPayload(req);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const platformRecordId = searchParams.get("platformRecordId");
  const priorityScore    = searchParams.get("priorityScore") || "0";
  const platform         = searchParams.get("platform") || "instagram";

  if (!platformRecordId) {
    return NextResponse.json({ error: "platformRecordId is required" }, { status: 400 });
  }

  // Encode state so callback knows which product_platforms record to update
  const state = Buffer.from(JSON.stringify({ platformRecordId, priorityScore, platform })).toString("base64url");

  const configId = process.env.META_IG_CONFIG_ID;

  // If a config_id is set → use Facebook Login for Business (Instagram channel)
  // This shows Instagram-branded login instead of Facebook login
  // Setup: Meta App Dashboard → Facebook Login for Business → Create config → select Instagram
  if (configId) {
    const oauthUrl = new URL("https://www.facebook.com/dialog/oauth");
    oauthUrl.searchParams.set("client_id", APP_ID);
    oauthUrl.searchParams.set("config_id", configId);
    oauthUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    oauthUrl.searchParams.set("response_type", "code");
    oauthUrl.searchParams.set("override_default_response_type", "true");
    oauthUrl.searchParams.set("state", state);
    return NextResponse.redirect(oauthUrl.toString());
  }

  // Fallback: standard Facebook OAuth (works with existing app setup)
  const oauthUrl = new URL("https://www.facebook.com/dialog/oauth");
  oauthUrl.searchParams.set("client_id", APP_ID);
  oauthUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  oauthUrl.searchParams.set("scope", SCOPES);
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set("state", state);

  return NextResponse.redirect(oauthUrl.toString());
}
