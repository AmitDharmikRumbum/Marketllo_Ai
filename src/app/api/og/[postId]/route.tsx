import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { eazeShow } from "@/lib/eazemyapi";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;

  let contentText = "Marketify AI";
  let platform = "Social";
  let contentType = "Post";

  try {
    const result = await eazeShow("scheduled_posts", postId);
    if (result?.success && result?.data) {
      const post = Array.isArray(result.data) ? result.data[0] : result.data;
      if (post?.content_text) contentText = post.content_text;
      if (post?.platform)     platform    = String(post.platform).charAt(0).toUpperCase() + String(post.platform).slice(1);
      if (post?.content_type) contentType = post.content_type;
    }
  } catch {
    // fallback to defaults
  }

  const displayText = contentText.slice(0, 120) + (contentText.length > 120 ? "…" : "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0F0E1A 0%, #1E1040 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "rgba(109,40,217,0.18)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "rgba(109,40,217,0.10)",
            display: "flex",
          }}
        />

        {/* Branding top-left */}
        <div
          style={{
            position: "absolute",
            top: "36px",
            left: "52px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "#6D28D9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ color: "white", fontSize: "18px", fontWeight: "900", display: "flex" }}>M</div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px", fontWeight: "700", display: "flex" }}>
            Marketify AI
          </div>
        </div>

        {/* Main content — centered */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 80px 40px 80px",
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: displayText.length > 80 ? "38px" : "48px",
              fontWeight: "700",
              lineHeight: "1.35",
              textAlign: "center",
              maxWidth: "960px",
              display: "flex",
            }}
          >
            {displayText}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 52px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                background: "#6D28D9",
                color: "white",
                fontSize: "13px",
                fontWeight: "700",
                padding: "5px 14px",
                borderRadius: "20px",
                display: "flex",
              }}
            >
              {platform}
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.8)",
                fontSize: "13px",
                fontWeight: "600",
                padding: "5px 14px",
                borderRadius: "20px",
                display: "flex",
              }}
            >
              {contentType}
            </div>
          </div>

          <div
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "13px",
              fontWeight: "500",
              display: "flex",
            }}
          >
            marketify.ai
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
