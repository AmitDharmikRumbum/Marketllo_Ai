import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload, getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const payload = getSessionPayload(req);

  if (!payload?.token) {
    return NextResponse.json({ user: null, _debug: "no_cookie_or_payload" });
  }

  const session = await getSession(payload.token);
  if (!session) {
    return NextResponse.json({ user: null, _debug: "session_not_found_in_db", storedUser: payload.user });
  }

  return NextResponse.json({ user: payload.user, _debug: "ok" });
}
