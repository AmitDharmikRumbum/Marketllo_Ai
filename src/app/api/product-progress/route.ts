import { NextRequest, NextResponse } from "next/server";
import { eazeQuery, toArray } from "@/lib/eazemyapi";
import { getSessionPayload } from "@/lib/auth";
import type { ProductAnalysis } from "@/store/onboarding";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionPayload(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = req.nextUrl.searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // Parallel: fetch analysis + platforms
    const [analysisResult, platformsResult] = await Promise.all([
      eazeQuery("get-product-analysis", { product_id: productId }),
      eazeQuery("get_product_platforms", { product_id: productId }),
    ]);

    // ── Parse analysis ─────────────────────────────────────────────────────────
    let analysis: ProductAnalysis | null = null;
    let analysisId: string | null = null;

    if (analysisResult.success) {
      const rows = toArray<{ id: string; analysis_json: string }>(analysisResult.data);
      if (rows.length > 0) {
        const latest = rows[rows.length - 1]; // last saved
        try {
          analysis = JSON.parse(latest.analysis_json) as ProductAnalysis;
          analysisId = latest.id;
        } catch { /* malformed JSON — treat as missing */ }
      }
    }

    // ── Parse platforms ────────────────────────────────────────────────────────
    const platforms = toArray<{ id: string; platform: string; status: string; priority_score: string }>(
      platformsResult.success ? platformsResult.data : null
    );

    // Deduplicate: keep latest record per platform (same logic as Step4Connect)
    const seen = new Set<string>();
    const uniquePlatforms = [...platforms].reverse().filter((p) => {
      if (seen.has(p.platform)) return false;
      seen.add(p.platform);
      return true;
    }).reverse();

    const selectedPlatforms = uniquePlatforms.map((p) => p.platform);
    const hasConnected = uniquePlatforms.some((p) => p.status === "CONNECTED");

    // ── Check if schedules have been saved ────────────────────────────────────
    // Uses custom query "get_platform_schedules" if it exists; falls back to "done" if not
    let hasSchedules = false;
    try {
      const schedulesResult = await eazeQuery("get_platform_schedules", { product_id: productId });
      if (schedulesResult.success) {
        hasSchedules = toArray(schedulesResult.data).length > 0;
      } else {
        // Custom query may not exist yet — assume done if platforms are connected
        hasSchedules = hasConnected;
      }
    } catch {
      hasSchedules = hasConnected; // fallback: connected = done
    }

    // ── Determine next step ────────────────────────────────────────────────────
    // Step 2 = AI Analysis   (product saved, but no analysis yet)
    // Step 3 = Select Platforms (analysis done, no platforms saved)
    // Step 4 = Connect Accounts (platforms saved, none connected)
    // Step 5 = AI Strategy  (at least one connected, but no schedules yet)
    // Step 6 = All done → dashboard
    let nextStep: number;

    if (!analysis) {
      nextStep = 2;
    } else if (uniquePlatforms.length === 0) {
      nextStep = 3;
    } else if (!hasConnected) {
      nextStep = 4;
    } else if (!hasSchedules) {
      nextStep = 5;
    } else {
      nextStep = 6; // fully set up → show dashboard
    }

    return NextResponse.json({
      nextStep,
      analysis,
      analysisId,
      selectedPlatforms,
    });
  } catch (err) {
    console.error("[product-progress] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
