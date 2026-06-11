import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth";

const META_VERSION = process.env.META_API_VERSION || "v25.0";
const IG_USER_ID   = process.env.IG_USER_ID!;
const IG_TOKEN     = process.env.IG_ACCESS_TOKEN!;
const GRAPH_BASE   = `https://graph.facebook.com/${META_VERSION}`;

// ── POST: Publish a photo post to Instagram ──────────────────────────────────
// Body: { imageUrl: string, caption: string }
//
// Instagram Graph API two-step flow:
//   Step 1 – Create a media container  → returns { id: containerId }
//   Step 2 – Publish the container     → returns { id: postId }
//
// imageUrl must be a publicly accessible HTTPS URL (Meta servers download it).
export async function POST(req: NextRequest) {
  try {
    const session = getSessionPayload(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl, caption } = await req.json();

    if (!imageUrl || !caption) {
      return NextResponse.json({ error: "imageUrl and caption are required" }, { status: 400 });
    }

    // ── Step 1: Create media container ────────────────────────────────────────
    const containerRes = await fetch(
      `${GRAPH_BASE}/${IG_USER_ID}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url:    imageUrl,
          caption:      caption,
          access_token: IG_TOKEN,
        }),
      }
    );
    const container = await containerRes.json();

    if (container.error) {
      console.error("[instagram/post] container error:", container.error);
      return NextResponse.json(
        { error: container.error.message || "Failed to create media container." },
        { status: 400 }
      );
    }

    const containerId = container.id;
    console.log("[instagram/post] container created:", containerId);

    // ── Step 2: Publish the container ─────────────────────────────────────────
    const publishRes = await fetch(
      `${GRAPH_BASE}/${IG_USER_ID}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id:  containerId,
          access_token: IG_TOKEN,
        }),
      }
    );
    const published = await publishRes.json();

    if (published.error) {
      console.error("[instagram/post] publish error:", published.error);
      return NextResponse.json(
        { error: published.error.message || "Failed to publish post." },
        { status: 400 }
      );
    }

    console.log("[instagram/post] published:", published.id);

    return NextResponse.json({
      success: true,
      postId: published.id,
      containerId,
    });
  } catch (err) {
    console.error("[instagram/post] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
