import { NextRequest, NextResponse } from "next/server";
import { eazeUpdate } from "@/lib/eazemyapi";
import { getSessionPayload } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionPayload(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  if (body.content_text  !== undefined) updates.content_text  = body.content_text;
  if (body.status        !== undefined) updates.status        = body.status;
  if (body.scheduled_at  !== undefined) updates.scheduled_at  = body.scheduled_at;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const result = await eazeUpdate("scheduled_posts", id, updates);
  if (!result?.success) {
    console.error("[scheduled-posts PATCH] update failed:", JSON.stringify(result));
    return NextResponse.json(
      { error: result?.message ?? "Update failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
