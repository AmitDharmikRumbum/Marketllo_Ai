import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth";

const CLIENT_ID    = process.env.LINKEDIN_CLIENT_ID!;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || "http://localhost:3000/api/auth/callback/linkedin";

// Scopes needed: profile + posting
const SCOPES = ["openid", "profile", "email", "w_member_social"].join(" ");

export async function GET(req: NextRequest) {
  const session = getSessionPayload(req);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const platformRecordId = searchParams.get("platformRecordId");
  const priorityScore    = searchParams.get("priorityScore") || "0";
  const platform         = searchParams.get("platform") || "linkedin";

  if (!platformRecordId) {
    return NextResponse.json({ error: "platformRecordId is required" }, { status: 400 });
  }

  const state = Buffer.from(JSON.stringify({ platformRecordId, priorityScore, platform })).toString("base64url");

  const oauthUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set("client_id", CLIENT_ID);
  oauthUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  oauthUrl.searchParams.set("scope", SCOPES);
  oauthUrl.searchParams.set("state", state);

  return NextResponse.redirect(oauthUrl.toString());
}
