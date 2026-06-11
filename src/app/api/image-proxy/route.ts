import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy external images (Pollinations AI) server-side.
 * Follows redirects, sets correct Content-Type, avoids browser CORS/redirect issues.
 * Usage: /api/image-proxy?url=https://image.pollinations.ai/prompt/...
 */
export async function GET(req: NextRequest) {
  const imageUrl = req.nextUrl.searchParams.get("url");
  if (!imageUrl) {
    return new NextResponse("url param required", { status: 400 });
  }

  try {
    const res = await fetch(imageUrl, {
      redirect: "follow",
      headers: {
        // Pretend to be a regular browser request
        "User-Agent": "Mozilla/5.0 (compatible; Marketllo/1.0)",
      },
    });

    if (!res.ok) {
      return new NextResponse(`Upstream error: ${res.status}`, { status: res.status });
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable", // cache for 24h
      },
    });
  } catch (err) {
    console.error("[image-proxy] fetch error:", err);
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
