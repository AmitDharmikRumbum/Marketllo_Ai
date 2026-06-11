import { NextRequest, NextResponse } from "next/server";
import { eazeAuth, eazeCreate, eazeUpdate, eazeQuery, toArray } from "@/lib/eazemyapi";

import { createSession, SESSION_COOKIE, COOKIE_OPTS, SessionPayload } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=google_cancelled", req.url));
  }

  try {
    // ── Exchange code for tokens ──────────────────────────────────────────────
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return NextResponse.redirect(new URL("/login?error=google_token_failed", req.url));
    }

    // ── Get Google user info ──────────────────────────────────────────────────
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();

    if (!profile.email) {
      return NextResponse.redirect(new URL("/login?error=google_no_email", req.url));
    }

    const normalizedEmail = profile.email.toLowerCase();
    const googlePassword = `google_${profile.id}`;

    // ── Try auth with google password ─────────────────────────────────────────
    let authResult = await eazeAuth(normalizedEmail, googlePassword);

    if (!authResult.success) {
      // ── Check if user already exists ──────────────────────────────────────
      const userQuery = await eazeQuery("user_by_email", { email: normalizedEmail });
      const existingUsers = toArray<Record<string, string>>(userQuery.data);

      if (userQuery.success && existingUsers.length > 0) {
        // User exists with a different password — update to google password
        const existingUser = existingUsers[0];
        await eazeUpdate("users", existingUser.id, { password: googlePassword });
        authResult = await eazeAuth(normalizedEmail, googlePassword);
      } else {
        // New user — create then auth
        await eazeCreate("users", {
          name: profile.name ?? normalizedEmail,
          email: normalizedEmail,
          profile_image: profile.picture ?? "",
          email_verified: "1",
          is_active: "1",
          password: googlePassword,
          provider: "google",
          provider_user_id: profile.id,
        });
        authResult = await eazeAuth(normalizedEmail, googlePassword);
      }
    }

    if (!authResult.success) {
      console.error("[google callback] final auth failed:", authResult);
      return NextResponse.redirect(new URL("/login?error=google_auth_failed", req.url));
    }

    const user = authResult.data;

    // ── Save platform to users table ──────────────────────────────────────────
    await eazeUpdate("users", user.id, { platform: "google" }, user.auth_token);

    // ── Create session ────────────────────────────────────────────────────────
    const sessionToken = await createSession(String(user.id), req);

    const payload: SessionPayload = {
      token: sessionToken,
      eazeToken: user.auth_token ?? "",
      user: { id: String(user.id), name: user.name ?? user.full_name ?? user.username ?? "", email: user.email ?? normalizedEmail },
    };

    const res = NextResponse.redirect(new URL("/projects", req.url));
    res.cookies.set(SESSION_COOKIE, JSON.stringify(payload), COOKIE_OPTS);
    return res;
  } catch (err) {
    console.error("[google callback] error:", err);
    return NextResponse.redirect(new URL("/login?error=google_failed", req.url));
  }
}
