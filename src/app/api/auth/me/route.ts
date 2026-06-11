import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const payload = getSessionPayload(req);

  if (!payload?.token || !payload?.user?.id) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Return user directly from the cookie — the cookie is httpOnly so it
  // cannot be tampered with from the browser.
  return NextResponse.json({ user: payload.user });
}
