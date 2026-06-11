import { NextRequest, NextResponse } from "next/server";
import { eazeCreate, eazeQuery, toArray } from "@/lib/eazemyapi";
import { getSessionPayload } from "@/lib/auth";
import type { ProductAnalysis } from "@/store/onboarding";

// ── GET: Load analysis for a product ──────────────────────────────────────────
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

    const result = await eazeQuery("get-product-analysis", { product_id: productId });
    const rows = toArray<{ id: string; analysis_json: string }>(result.data);

    if (!rows.length) {
      return NextResponse.json({ analysis: null, id: null });
    }

    const latest = rows[rows.length - 1];
    try {
      const analysis = JSON.parse(latest.analysis_json) as ProductAnalysis;
      return NextResponse.json({ analysis, id: latest.id });
    } catch {
      return NextResponse.json({ analysis: null, id: null });
    }
  } catch (err) {
    console.error("[product-analysis GET] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionPayload(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, analysis } = await req.json();

    if (!productId || !analysis) {
      return NextResponse.json({ error: "productId and analysis are required" }, { status: 400 });
    }

    console.log("[product-analysis] saving for productId:", productId);

    const result = await eazeCreate("product_analysis", {
      product_id: productId,
      is_active: "1",
      analysis_json: JSON.stringify(analysis),
    }, session.eazeToken);

    console.log("[product-analysis] result:", JSON.stringify(result));

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Failed to save." }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (err) {
    console.error("[product-analysis] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
