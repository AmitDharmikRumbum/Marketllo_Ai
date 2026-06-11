import { NextRequest, NextResponse } from "next/server";
import { eazeAuth, eazeCreate } from "@/lib/eazemyapi";
import { createSession, SESSION_COOKIE, COOKIE_OPTS, SessionPayload } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userResult = await eazeCreate("users", {
      name: name.trim(),
      email: normalizedEmail,
      profile_image: "",
      email_verified: "1",
      is_active: "1",
      password,
      provider: "email",
      provider_user_id: normalizedEmail,
    });

    if (!userResult.success) {
      const emailTaken =
        typeof userResult.error === "string" &&
        userResult.error.toLowerCase().includes("email");
      return NextResponse.json(
        { error: emailTaken ? "Account already exists. Please log in instead." : "Failed to create account. Please try again." },
        { status: emailTaken ? 409 : 500 }
      );
    }

    const user = userResult.data as Record<string, string>;

    const authResult = await eazeAuth(normalizedEmail, password);
    const eazeToken: string = authResult?.data?.auth_token ?? "";

    const sessionToken = await createSession(String(user.id), req);

    const payload: SessionPayload = {
      token: sessionToken,
      eazeToken,
      user: { id: String(user.id), name: user.name, email: user.email },
    };

    const res = NextResponse.json({ success: true, user: payload.user });
    res.cookies.set(SESSION_COOKIE, JSON.stringify(payload), COOKIE_OPTS);
    return res;
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
