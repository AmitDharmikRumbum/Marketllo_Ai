import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth";

const APP_ID       = process.env.META_APP_ID!;
const REDIRECT_URI = process.env.FB_REDIRECT_URI || "http://localhost:3000/api/auth/callback/facebook";

const SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "pages_manage_engagement",
  "pages_read_user_content",
].join(",");

export async function GET(req: NextRequest) {
  const session = getSessionPayload(req);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const platformRecordId = searchParams.get("platformRecordId");
  const priorityScore    = searchParams.get("priorityScore") || "0";
  const platform         = searchParams.get("platform") || "facebook";

  if (!platformRecordId) {
    return NextResponse.json({ error: "platformRecordId is required" }, { status: 400 });
  }

  const state = Buffer.from(JSON.stringify({ platformRecordId, priorityScore, platform })).toString("base64url");

  const oauthUrl = new URL("https://www.facebook.com/dialog/oauth");
  oauthUrl.searchParams.set("client_id", APP_ID);
  oauthUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  oauthUrl.searchParams.set("scope", SCOPES);
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set("state", state);

  return NextResponse.redirect(oauthUrl.toString());
}
