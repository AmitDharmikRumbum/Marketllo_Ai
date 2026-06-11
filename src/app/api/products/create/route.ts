import { NextRequest, NextResponse } from "next/server";
import { eazeCreate } from "@/lib/eazemyapi";
import { getSessionPayload } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = getSessionPayload(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
  }

  try {
    const { product, analysis, selectedPlatforms, strategy } = await req.json();

    // Derive a display name from the analysis or the website URL
    let productName = analysis?.productName || "";
    if (!productName) {
      try {
        productName = new URL(product.websiteUrl).hostname.replace(/^www\./, "");
      } catch {
        productName = product.websiteUrl;
      }
    }

    // Derive logo_url from website favicon (required by DB — cannot be empty)
    let logoUrl = "";
    try {
      const origin = new URL(product.websiteUrl).origin;
      logoUrl = `${origin}/favicon.ico`;
    } catch {
      logoUrl = "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(product.websiteUrl);
    }

    // Create product row — field names match actual DB columns
    const productResult = await eazeCreate("products", {
      user_id:       String(session.user.id),
      product_name:  productName,
      website_url:   product.websiteUrl,
      appstore_url:  product.appUrl || "",
      playstore_url: "",
      product_desc:  (product.description || "").slice(0, 255),
      logo_url:      logoUrl,
    });

    if (!productResult.success) {
      console.error("EazeMyAPI create product failed:", JSON.stringify(productResult));
      return NextResponse.json({
        error: "Failed to save product.",
        detail: productResult.error ?? productResult.message ?? "unknown",
      }, { status: 500 });
    }

    const savedProduct = productResult.data as Record<string, unknown>;

    return NextResponse.json({ success: true, product: savedProduct });
  } catch (err) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
