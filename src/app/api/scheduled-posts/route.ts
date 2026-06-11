import { NextRequest, NextResponse } from "next/server";
import { eazeQuery, toArray } from "@/lib/eazemyapi";
import { getSessionPayload } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = getSessionPayload(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const result = await eazeQuery("get_scheduled_posts", { product_id: productId });
  if (!result.success) {
    console.error("[scheduled-posts] get_scheduled_posts failed:", result.message);
    return NextResponse.json({ posts: [] });
  }

  const posts = toArray<Record<string, unknown>>(result.data)
    .sort((a, b) => String(a.scheduled_at ?? "").localeCompare(String(b.scheduled_at ?? "")));

  return NextResponse.json({ posts });
}
