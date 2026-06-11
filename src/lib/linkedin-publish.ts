/**
 * Shared LinkedIn publishing logic — used by both /api/publish-now and /api/cron/publish
 */

const LI_API = "https://api.linkedin.com/v2";

export interface PublishResult {
  success: boolean;
  linkedInPostId?: string;
  error?: string;
}

/** Fetch binary buffer from a URL (handles absolute https URLs and /api/... relative paths) */
export async function fetchImageBuffer(
  imageUrl: string,
  origin: string
): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  try {
    const fetchUrl = imageUrl.startsWith("/") ? `${origin}${imageUrl}` : imageUrl;
    const res = await fetch(fetchUrl, { redirect: "follow" });
    if (!res.ok) {
      console.error(`[linkedin-publish] image fetch failed (${res.status}): ${fetchUrl}`);
      return null;
    }
    return { buffer: await res.arrayBuffer(), contentType: res.headers.get("content-type") ?? "image/jpeg" };
  } catch (err) {
    console.error("[linkedin-publish] fetchImageBuffer error:", err);
    return null;
  }
}

/** Full LinkedIn asset upload flow: register → binary PUT → return asset URN */
export async function uploadLinkedInImage(
  imageUrl: string,
  accessToken: string,
  memberId: string,
  origin: string
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
        serviceRelationships: [{ relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" }],
      },
    }),
  });

  if (!registerRes.ok) {
    console.error("[linkedin-publish] registerUpload failed:", registerRes.status, await registerRes.text());
    return null;
  }

  const registerData = await registerRes.json();
  const uploadUrl: string | undefined =
    registerData?.value?.uploadMechanism?.["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]?.uploadUrl;
  const assetUrn: string | undefined = registerData?.value?.asset;

  if (!uploadUrl || !assetUrn) {
    console.error("[linkedin-publish] missing uploadUrl/assetUrn:", registerData);
    return null;
  }

  // 2. Fetch binary
  const imgData = await fetchImageBuffer(imageUrl, origin);
  if (!imgData) return null;

  // 3. PUT binary to LinkedIn
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": imgData.contentType },
    body: imgData.buffer,
  });

  if (!putRes.ok) {
    console.error("[linkedin-publish] binary PUT failed:", putRes.status, await putRes.text());
    return null;
  }

  return assetUrn;
}

/** Publish a post to LinkedIn. Returns the LinkedIn post ID on success. */
export async function publishToLinkedIn(opts: {
  contentText: string;
  contentImageUrl: string;
  accessToken: string;
  memberId: string;
  origin: string;
}): Promise<PublishResult> {
  const { contentText, contentImageUrl, accessToken, memberId, origin } = opts;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ugcContent: Record<string, any> = {
    shareCommentary: { text: contentText },
    shareMediaCategory: "NONE",
  };

  if (contentImageUrl) {
    const assetUrn = await uploadLinkedInImage(contentImageUrl, accessToken, memberId, origin);
    if (assetUrn) {
      ugcContent.shareMediaCategory = "IMAGE";
      ugcContent.media = [{ status: "READY", media: assetUrn }];
    } else {
      console.warn("[linkedin-publish] image upload failed, falling back to text-only");
    }
  }

  const ugcBody = {
    author: `urn:li:person:${memberId}`,
    lifecycleState: "PUBLISHED",
    specificContent: { "com.linkedin.ugc.ShareContent": ugcContent },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };

  const ugcRes = await fetch(`${LI_API}/ugcPosts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(ugcBody),
  });

  const ugcData = await ugcRes.json();

  if (!ugcRes.ok) {
    console.error("[linkedin-publish] ugcPosts error:", ugcData);
    return { success: false, error: ugcData?.message ?? "LinkedIn API error" };
  }

  return { success: true, linkedInPostId: ugcData?.id ?? "" };
}
