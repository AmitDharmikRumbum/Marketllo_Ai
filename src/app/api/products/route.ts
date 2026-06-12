import { NextRequest, NextResponse } from "next/server";
import { eazeQuery, eazeUpdate, toArray } from "@/lib/eazemyapi";
import { getSessionPayload } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = getSessionPayload(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await eazeQuery("user_products", { user_id: String(session.user.id) });
  const products = result.success ? toArray<Record<string, string>>(result.data) : [];

  // For products with no status, check if they have connected platforms
  // to determine real status. Run in parallel.
  const productsWithStatus = await Promise.all(
    products.map(async (p) => {
      // Already has a real status — use it
      if (p.status === "active" || p.status === "inactive" || p.status === "pending") {
        return p;
      }

      // No status yet — check if any platforms are connected
      try {
        const platResult = await eazeQuery("get_product_platforms", { product_id: String(p.id) });
        const platforms = toArray<Record<string, string>>(platResult.data);
        const hasConnected = platforms.some((pl) => pl.status === "CONNECTED");
        const allDisabled  = platforms.length > 0 && platforms.every((pl) => pl.status === "DISABLED");

        const derivedStatus = allDisabled ? "inactive" : hasConnected ? "active" : "pending";

        // Persist the derived status so we don't re-check next time
        if (derivedStatus !== p.status) {
          eazeUpdate("products", p.id, { status: derivedStatus }).catch(() => {});
        }

        return { ...p, status: derivedStatus };
      } catch {
        return { ...p, status: "active" }; // fallback: assume active
      }
    })
  );

  return NextResponse.json({ success: true, products: productsWithStatus });
}
