import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload, getSession } from "@/lib/auth";
import { eazeShow } from "@/lib/eazemyapi";

export async function GET(req: NextRequest) {
  const payload = getSessionPayload(req);
  if (!payload?.token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Validate session is still live in EazeMyAPI
  const session = await getSession(payload.token);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Always fetch fresh user record so name/email are never stale.
  let userName = payload.user.name;
  if (payload.user.id) {
    try {
      const userRecord = await eazeShow("users", payload.user.id);
      // eazeShow may or may not have a `success` wrapper — grab data either way
      const u = userRecord?.data ?? userRecord;
      if (u?.name) userName = u.name;
    } catch {
      // non-critical — fall back to whatever is in the cookie
    }
  }

  return NextResponse.json({ user: { ...payload.user, name: userName } });
}
