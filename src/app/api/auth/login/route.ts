import { NextRequest, NextResponse } from "next/server";
import { eazeAuth, eazeUpdate } from "@/lib/eazemyapi";
import { createSession, SESSION_COOKIE, COOKIE_OPTS, SessionPayload } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, remember } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const authResult = await eazeAuth(email.toLowerCase().trim(), password);
    if (!authResult.success) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const user = authResult.data;

    // ── Save platform to users table ──────────────────────────────────────────
    await eazeUpdate("users", user.id, { platform: "email_login" }, user.auth_token);

    const sessionToken = await createSession(String(user.id), req);

    const payload: SessionPayload = {
      token: sessionToken,
      eazeToken: user.auth_token ?? "",
      user: { id: String(user.id), name: user.name ?? user.full_name ?? user.username ?? "", email: user.email ?? "" },
    };

    const res = NextResponse.json({ success: true, user: payload.user });
    res.cookies.set(SESSION_COOKIE, JSON.stringify(payload), {
      ...COOKIE_OPTS,
      maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30 days or 1 day
    });
    return res;
  } catch (err) {
    console.error("[login] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
