import { NextRequest, NextResponse } from "next/server";
import {
  getSessionPayload,
  getSession,
  invalidateAllSessions,
  SESSION_COOKIE,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const payload = getSessionPayload(req);

  if (payload?.token) {
    // Verify the session is real before trusting the user_id inside it
    const session = await getSession(payload.token);
    if (session) {
      // Soft-delete ALL sessions for this user
      await invalidateAllSessions(session.user_id);
    }
  }

  const res = NextResponse.json({ success: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
