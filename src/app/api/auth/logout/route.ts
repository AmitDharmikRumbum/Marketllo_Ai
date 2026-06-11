import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload, getSession, invalidateSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const payload = getSessionPayload(req);

  if (payload?.token) {
    // Look up the session record so we have its DB id
    const session = await getSession(payload.token);
    if (session) {
      // Soft-delete: set expires_at to the past
      await invalidateSession(session.id);
    }
  }

  const res = NextResponse.json({ success: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
