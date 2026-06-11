import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth";

const BASE    = "https://api.eazemyapi.com";
const PROJECT = process.env.EAZEMYAPI_PROJECT!;
const KEY     = process.env.EAZEMYAPI_KEY!;
const VERSION = "v1";

function hdrs() {
  return { "Content-Type": "application/json", "X-API-SIGNATURE": KEY };
}

export async function GET(req: NextRequest) {
  const session = getSessionPayload(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const results: Record<string, unknown> = {
    config: { PROJECT, hasKey: !!KEY, VERSION },
  };

  // ── 1. Test get_product_platforms ─────────────────────────────────────────
  try {
    const url = `${BASE}/${PROJECT}/${VERSION}/get_product_platforms?product_id=${productId}`;
    const res = await fetch(url, { headers: hdrs(), cache: "no-store" });
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text.slice(0, 500) }; }
    results.get_product_platforms = { status: res.status, body: parsed };
  } catch (e) {
    results.get_product_platforms = { error: String(e) };
  }

  // ── 2. Test get_scheduled_posts ───────────────────────────────────────────
  try {
    const url = `${BASE}/${PROJECT}/${VERSION}/get_scheduled_posts?product_id=${productId}`;
    const res = await fetch(url, { headers: hdrs(), cache: "no-store" });
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text.slice(0, 500) }; }
    results.get_scheduled_posts = { status: res.status, body: parsed };
  } catch (e) {
    results.get_scheduled_posts = { error: String(e) };
  }

  // ── 3. Create a test platform_schedule to get a real integer schedule_id ─
  let testScheduleId: number | null = null;
  try {
    const platformsBody = results.get_product_platforms as { body?: { data?: Array<{ id: string }> } };
    const realPlatformRecordId = platformsBody?.body?.data?.[0]?.id ?? "";

    const url = `${BASE}/${PROJECT}/${VERSION}/platform_schedules/create`;
    const body = {
      product_id:         productId,
      platform_record_id: realPlatformRecordId,
      platform:           "linkedin",
      day_of_week:        0,
      content_type:       "Post",
      post_time:          "09:00 AM",
      is_enabled:         "1",
      credits_cost:       1,
    };
    const res = await fetch(url, { method: "POST", headers: hdrs(), body: JSON.stringify(body) });
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text.slice(0, 300) }; }
    results.create_platform_schedule = { status: res.status, body: parsed };
    testScheduleId = parsed?.data?.id ?? null;
  } catch (e) {
    results.create_platform_schedule = { error: String(e) };
  }

  // ── 4. Test scheduled_posts/create with real IDs ──────────────────────────
  try {
    const url = `${BASE}/${PROJECT}/${VERSION}/scheduled_posts/create`;
    const platformsBody = results.get_product_platforms as { body?: { data?: Array<{ id: string }> } };
    const realPlatformRecordId = platformsBody?.body?.data?.[0]?.id ?? "";

    const body = {
      product_id:         productId,
      platform_record_id: realPlatformRecordId,
      schedule_id:        testScheduleId ?? 0,
      platform:           "linkedin",
      content_type:       "Post",
      content_text:       "Debug test post",
      content_image_url:  "",
      scheduled_at:       "2026-06-16 09:00:00",
      status:             "READY",
      credits_used:       1,
    };
    const res = await fetch(url, {
      method:  "POST",
      headers: hdrs(),
      body:    JSON.stringify(body),
    });
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text.slice(0, 500) }; }
    results.create_scheduled_post = { status: res.status, body: parsed, sentBody: body };
  } catch (e) {
    results.create_scheduled_post = { error: String(e) };
  }

  return NextResponse.json(results, { status: 200 });
}
