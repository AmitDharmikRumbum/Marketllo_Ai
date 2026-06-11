import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload, getSession } from "@/lib/auth";

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

  // DEBUG: return full payload to trace name issue
  return NextResponse.json({ user: payload.user, _debug: { fullPayloadUser: payload.user, eazeTokenFirst10: payload.eazeToken?.slice(0,10) } });
}
