import { NextRequest, NextResponse } from "next/server";
import { eazeQuery, eazeQueryPost, eazeUpdate, toArray } from "@/lib/eazemyapi";
import { getSessionPayload } from "@/lib/auth";

// ── GET: Load platforms for a product from DB ─────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = getSessionPayload(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const result = await eazeQuery("get_product_platforms", { product_id: productId });
    const platforms = toArray(result.data);

    return NextResponse.json({ platforms });
  } catch (err) {
    console.error("[product-platforms GET] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// ── PATCH: Toggle platform enabled/disabled ───────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionPayload(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platformId, status } = await req.json() as { platformId: string; status: string };
    if (!platformId || !status) {
      return NextResponse.json({ error: "platformId and status are required" }, { status: 400 });
    }

    const result = await eazeUpdate("product_platforms", platformId, { status });
    if (!result?.success) {
      console.error("[product-platforms PATCH] update failed:", JSON.stringify(result));
      return NextResponse.json({ error: result?.message ?? "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[product-platforms PATCH] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// ── POST: Save selected platforms (skips platforms already saved for this product) ──
export async function POST(req: NextRequest) {
  try {
    const session = getSessionPayload(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, analysisId, selectedPlatforms, allPlatforms } = await req.json();

    if (!productId || !selectedPlatforms?.length) {
      return NextResponse.json({ error: "productId and selectedPlatforms are required" }, { status: 400 });
    }

    // ── Save each selected platform via add-product-platform custom query ──────
    // This endpoint handles deduplication (won't create duplicates for same product+platform)
    const saves = (selectedPlatforms as string[]).map((platform: string) => {
      const platformData = allPlatforms?.find((p: { platform: string; score: number }) => p.platform === platform);
      const score = platformData?.score ?? 0;

      return eazeQueryPost("add-product-platform", {
        product_id:         productId,
        analysis_id:        analysisId ?? "",
        platform,
        is_selected:        "1",
        priority_score:     score.toFixed(2),
        status:             "PENDING",
        platform_user_id:   "",
        platform_username:  "",
        media_access_token: "",
        token_expires_at:   "2099-12-31 00:00:00",
      });
    });

    const results = await Promise.all(saves);
    console.log("[product-platforms] save results:", JSON.stringify(results));

    const failed = results.filter((r) => !r.success);

    if (failed.length > 0) {
      console.error("[product-platforms] failed saves:", JSON.stringify(failed));
      return NextResponse.json({
        success: false,
        error: failed[0]?.error ?? "Failed to save platforms. Please try again.",
        failed: failed.length,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      saved: results.length,
      total: results.length,
    });
  } catch (err) {
    console.error("[product-platforms] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
