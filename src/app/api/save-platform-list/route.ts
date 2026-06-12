import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth";

const BASE    = "https://api.eazemyapi.com";
const PROJECT = process.env.EAZEMYAPI_PROJECT!;
const KEY     = process.env.EAZEMYAPI_KEY!;

export async function POST(req: NextRequest) {
  const session = getSessionPayload(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform_names } = await req.json();

  if (!platform_names) {
    return NextResponse.json({ error: "platform_names required" }, { status: 400 });
  }

  const res = await fetch(`${BASE}/${PROJECT}/v1/add_suport_socialmedia_platform`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-SIGNATURE": KEY,
    },
    body: JSON.stringify({ platform_names }),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
