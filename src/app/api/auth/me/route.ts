import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload, getSession } from "@/lib/auth";
import { eazeQuery, toArray } from "@/lib/eazemyapi";

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

  // If name is missing from cookie (older session or auth didn't return it),
  // do a fresh lookup by email so the UI always shows the real name.
  let userName = payload.user.name;
  if (!userName && payload.user.email) {
    try {
      const userResult = await eazeQuery("user_by_email", { email: payload.user.email });
      const rows = toArray<Record<string, string>>(userResult.data);
      if (rows.length > 0) {
        userName = rows[0].name ?? rows[0].full_name ?? rows[0].username ?? "";
      }
    } catch {
      // fall back to empty string — won't block the request
    }
  }

  return NextResponse.json({ user: { ...payload.user, name: userName } });
}
