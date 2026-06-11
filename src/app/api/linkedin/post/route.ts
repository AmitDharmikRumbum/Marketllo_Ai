import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth";
import { eazeShow } from "@/lib/eazemyapi";

const LI_API = "https://api.linkedin.com/v2";

/** Fetch binary buffer from a URL (handles absolute https URLs and /api/og/... local paths) */
async function fetchImageBuffer(
  imageUrl: string
): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  try {
    let fetchUrl = imageUrl;
    if (imageUrl.startsWith("/")) {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      fetchUrl = `${base}${imageUrl}`;
    }
    const res = await fetch(fetchUrl);
    if (!res.ok) {
      console.error(`[li-post] image fetch failed (${res.status}): ${fetchUrl}`);
      return null;
    }
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/png";
    return { buffer, contentType };
  } catch (err) {
    console.error("[li-post] fetchImageBuffer error:", err);
    return null;
  }
}

/** Full LinkedIn asset upload flow: register → binary PUT → return asset URN */
async function uploadLinkedInImage(
  imageUrl: string,
  accessToken: string,
  memberId: string
): Promise<string | null> {
  // 1. Register upload
  const registerRes = await fetch(`${LI_API}/assets?action=registerUpload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        owner: `urn:li:person:${memberId}`,
        serviceRelationships: [
          {
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent",
          },
        ],
      },
    }),
  });

  if (!registerRes.ok) {
    const errBody = await registerRes.text();
    console.error("[li-post] LinkedIn registerUpload failed:", registerRes.status, errBody);
    return null;
  }

  const registerData = await registerRes.json();
  const uploadUrl: string | undefined =
    registerData?.value?.uploadMechanism?.[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ]?.uploadUrl;
  const assetUrn: string | undefined = registerData?.value?.asset;

  if (!uploadUrl || !assetUrn) {
    console.error("[li-post] Missing uploadUrl or assetUrn:", registerData);
    return null;
  }

  // 2. Fetch binary
  const imgData = await fetchImageBuffer(imageUrl);
  if (!imgData) return null;

  // 3. PUT binary to LinkedIn
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": imgData.contentType,
    },
    body: imgData.buffer,
  });

  if (!putRes.ok) {
    const errBody = await putRes.text();
    console.error("[li-post] LinkedIn binary PUT failed:", putRes.status, errBody);
    return null;
  }

  return assetUrn;
}

export async function POST(req: NextRequest) {
  const session = getSessionPayload(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { platformRecordId, text, imageUrl } = body;

  if (!platformRecordId || !text) {
    return NextResponse.json({ error: "platformRecordId and text are required" }, { status: 400 });
  }

  // ── Step 1: Get the platform record (access token + member ID) ─────────────
  let platformRow: {
    media_access_token: string;
    platform_user_id: string;
    status: string;
  } | null = null;

  try {
    const result = await eazeShow("product_platforms", platformRecordId);
    if (result?.data) {
      platformRow = Array.isArray(result.data) ? result.data[0] : result.data;
    }
  } catch (err) {
    console.error("[li-post] failed to fetch platform record:", err);
    return NextResponse.json({ error: "Failed to retrieve platform credentials" }, { status: 500 });
  }

  if (!platformRow) {
    return NextResponse.json({ error: "Platform record not found" }, { status: 404 });
  }

  if (platformRow.status !== "CONNECTED" && platformRow.status !== "ACTIVE") {
    return NextResponse.json({ error: "LinkedIn account is not connected" }, { status: 400 });
  }

  const accessToken = platformRow.media_access_token;
  const memberId    = platformRow.platform_user_id;

  if (!accessToken || !memberId) {
    return NextResponse.json({ error: "Missing LinkedIn credentials" }, { status: 400 });
  }

  // ── Step 2: Handle image upload if provided ───────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ugcContent: Record<string, any> = {
    shareCommentary:    { text },
    shareMediaCategory: "NONE",
  };

  if (imageUrl) {
    const assetUrn = await uploadLinkedInImage(imageUrl, accessToken, memberId);
    if (assetUrn) {
      ugcContent.shareMediaCategory = "IMAGE";
      ugcContent.media = [
        {
          status: "READY",
          media:  assetUrn,
        },
      ];
    } else {
      console.warn("[li-post] Image upload failed, falling back to text-only post");
    }
  }

  // ── Step 3: Build the UGC post payload ────────────────────────────────────
  const postBody = {
    author:         `urn:li:person:${memberId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": ugcContent,
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  // ── Step 4: Publish the post ──────────────────────────────────────────────
  try {
    const postRes = await fetch(`${LI_API}/ugcPosts`, {
      method:  "POST",
      headers: {
        Authorization:               `Bearer ${accessToken}`,
        "Content-Type":              "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postBody),
    });

    const postData = await postRes.json();

    if (!postRes.ok) {
      console.error("[li-post] LinkedIn API error:", postData);
      return NextResponse.json(
        { error: postData.message || "LinkedIn API error", details: postData },
        { status: postRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      postId:  postData.id,
      message: "Post published to LinkedIn successfully",
    });
  } catch (err) {
    console.error("[li-post] error:", err);
    return NextResponse.json({ error: "Failed to publish LinkedIn post" }, { status: 500 });
  }
}
