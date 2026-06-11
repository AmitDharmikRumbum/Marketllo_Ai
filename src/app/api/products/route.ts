import { NextRequest, NextResponse } from "next/server";
import { eazeQuery, toArray } from "@/lib/eazemyapi";
import { getSessionPayload } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = getSessionPayload(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await eazeQuery("user_products", { user_id: String(session.user.id) });

  return NextResponse.json({
    success: true,
    products: result.success ? toArray(result.data) : [],
  });
}
