import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth";
import { eazeCreate, eazeQuery, toArray } from "@/lib/eazemyapi";
import Anthropic from "@anthropic-ai/sdk";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DaySlot {
  enabled: boolean;
  type: string;
  time: string;
}

interface PlatformSchedule {
  platform: string;
  postsPerWeek: number;
  days: DaySlot[]; // index 0=Mon … 6=Sun
}

interface ProductAnalysis {
  productName: string;
  category: string;
  tagline: string;
  audience: { title: string; description: string; roles: string; industry: string };
  contentStyle: { name: string; description: string; pillars: string[] };
  postIdeas: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the next Date for a given day-of-week (0=Mon…6=Sun) + time string "9:00 AM" */
function nextOccurrence(dayOfWeek: number, timeStr: string): Date {
  const now = new Date();
  const todayOurDay = (now.getDay() + 6) % 7; // JS 0=Sun → our 0=Mon
  let daysUntil = (dayOfWeek - todayOurDay + 7) % 7;
  if (daysUntil === 0) daysUntil = 7; // schedule same-day slot for next week if today

  const target = new Date(now);
  target.setDate(now.getDate() + daysUntil);

  // Parse "9:00 AM" / "11:00 PM"
  const [timePart, ampm] = timeStr.split(" ");
  const [hStr, mStr] = timePart.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  target.setHours(h, m, 0, 0);

  return target;
}

function toMysqlDatetime(d: Date): string {
  return d.toISOString().replace("T", " ").replace("Z", "").split(".")[0];
}

/** Credit cost for a content type */
function creditCost(type: string): number {
  const costs: Record<string, number> = {
    Post: 1, Tweet: 1, Article: 1,
    Carousel: 2, Thread: 2, Short: 2,
    Reel: 3, Video: 3,
  };
  return costs[type] ?? 1;
}

// ─── AI content generation ────────────────────────────────────────────────────

const PLATFORM_TONE: Record<string, string> = {
  linkedin:  "professional, thought-leadership, no hashtags, 150–250 words",
  instagram: "visual, engaging, conversational, 5–8 hashtags at the end, 80–150 words",
  twitter:   "punchy, concise, under 260 characters, 1–2 hashtags max",
  facebook:  "friendly, community-focused, 100–200 words",
  tiktok:    "trendy, energetic, hook in first line, 50–100 words",
  youtube:   "descriptive, SEO-friendly title + 100-word description",
};

const TYPE_INSTRUCTION: Record<string, string> = {
  Post:     "Write a text post.",
  Article:  "Write a short LinkedIn article intro (title + 200-word opening).",
  Reel:     "Write a short-form video script: 3-second hook, 20-second main content, 5-second CTA.",
  Carousel: "Write 5 carousel slide captions (Slide 1: hook, Slides 2-4: value points, Slide 5: CTA).",
  Tweet:    "Write a single tweet (under 260 characters).",
  Thread:   "Write a 4-tweet thread. Number each tweet.",
  Video:    "Write a YouTube video script outline: title, hook, 3 main points, CTA.",
  Short:    "Write a short vertical video script (15–30 seconds): hook, point, CTA.",
};

async function generateContent(
  platform: string,
  contentType: string,
  analysis: ProductAnalysis,
  postIdea: string
): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY! });
  const tone = PLATFORM_TONE[platform] ?? "engaging, 150 words";
  const typeInstr = TYPE_INSTRUCTION[contentType] ?? "Write a social media post.";

  const prompt = `You are a social media content writer for ${analysis.productName}.

Product: ${analysis.productName}
Tagline: ${analysis.tagline}
Category: ${analysis.category}
Audience: ${analysis.audience.title} — ${analysis.audience.description}
Industry: ${analysis.audience.industry} | Roles: ${analysis.audience.roles}
Content style: ${analysis.contentStyle.name} — ${analysis.contentStyle.description}
Content pillars: ${analysis.contentStyle.pillars.join(", ")}
Post idea to base this on: ${postIdea}

Platform: ${platform.toUpperCase()}
Tone & format: ${tone}
Task: ${typeInstr}

Return ONLY the post content. No preamble, no explanation, no labels.`;

  const msg = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  return msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = getSessionPayload(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, schedules, analysis } = (await req.json()) as {
    productId: string;
    schedules: PlatformSchedule[];
    analysis: ProductAnalysis;
  };

  if (!productId || !schedules?.length) {
    return NextResponse.json({ error: "productId and schedules are required" }, { status: 400 });
  }

  // ── 1. Fetch product_platforms to map platform → platform_record_id ──────────
  const platformsResult = await eazeQuery("get_product_platforms", { product_id: productId });
  const platformRows = toArray<{ id: string; platform: string; status: string }>(platformsResult.data);
  const platformRecordMap: Record<string, string> = {};
  for (const row of platformRows) {
    platformRecordMap[row.platform] = row.id;
  }

  // ── 2. Save platform_schedules (all 7 days per platform) ─────────────────────
  const scheduleIdMap: Record<string, Record<number, string>> = {}; // platform → dayIdx → schedule_id

  const scheduleSaves = schedules.flatMap((sched) => {
    scheduleIdMap[sched.platform] = {};
    const platformRecordId = platformRecordMap[sched.platform] ?? "";
    return sched.days.map((slot, dayIdx) =>
      eazeCreate("platform_schedules", {
        product_id:         productId,
        platform_record_id: platformRecordId,
        platform:           sched.platform,
        day_of_week:        dayIdx,
        content_type:       slot.type,
        post_time:          slot.time,
        is_enabled:         slot.enabled ? "1" : "0",
        credits_cost:       creditCost(slot.type),
      }).then((res) => {
        if (res?.data?.id) {
          scheduleIdMap[sched.platform][dayIdx] = String(res.data.id);
        }
        return res;
      })
    );
  });

  await Promise.all(scheduleSaves);
  console.log("[save-strategy] schedules saved for platforms:", schedules.map((s) => s.platform));

  // ── 3. Generate content + create scheduled_posts for each enabled slot ────────
  const postIdeas = analysis?.postIdeas ?? ["Highlight key product benefits", "Share a customer success story", "Introduce the team", "Share a product tip"];
  let ideaIndex = 0;

  const postTasks = schedules.flatMap((sched) =>
    sched.days
      .map((slot, dayIdx) => ({ slot, dayIdx }))
      .filter(({ slot }) => slot.enabled)
      .map(async ({ slot, dayIdx }) => {
        const platformRecordId = platformRecordMap[sched.platform] ?? "";
        const scheduleId = scheduleIdMap[sched.platform]?.[dayIdx] ?? "";
        const scheduledAt = nextOccurrence(dayIdx, slot.time);
        const postIdea = postIdeas[ideaIndex++ % postIdeas.length];

        // Generate AI content
        let contentText = "";
        try {
          contentText = await generateContent(sched.platform, slot.type, analysis, postIdea);
        } catch (err) {
          console.error(`[save-strategy] content gen failed for ${sched.platform} day ${dayIdx}:`, err);
          contentText = postIdea; // fallback to the idea
        }

        const createResult = await eazeCreate("scheduled_posts", {
          product_id:         productId,
          platform_record_id: platformRecordId,
          schedule_id:        scheduleIdMap[sched.platform]?.[dayIdx] ?? "",
          platform:           sched.platform,
          content_type:       slot.type,
          content_text:       contentText,
          content_image_url:  "",
          scheduled_at:       toMysqlDatetime(scheduledAt),
          status:             "READY",
          credits_used:       creditCost(slot.type),
        });

        if (!createResult?.success) {
          console.error(`[save-strategy] scheduled_post create failed for ${sched.platform} day ${dayIdx}:`, createResult?.message, JSON.stringify(createResult));
        } else {
          console.log(`[save-strategy] scheduled_post created id=${createResult?.data?.id} platform=${sched.platform} day=${dayIdx}`);
        }

        return createResult;
      })
  );

  const postResults = await Promise.all(postTasks);
  const postsCreated = postResults.filter((r) => r?.success).length;

  console.log(`[save-strategy] created ${postsCreated} scheduled posts`);

  return NextResponse.json({
    success: true,
    schedulesCreated: scheduleSaves.length,
    postsCreated,
  });
}
