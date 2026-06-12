"use client";

import { useState } from "react";
import { useOnboarding } from "@/store/onboarding";
import { useRouter } from "next/navigation";

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TIMES = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM",
];

// Which day indices to enable for N posts/week
const DAY_DISTRIBUTION: Record<number, number[]> = {
  0: [],
  1: [2],
  2: [1, 4],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
};

// Credit cost per content type
const CREDIT_COST: Record<string, number> = {
  Post: 1, Tweet: 1, Article: 1,
  Carousel: 2, Thread: 2, Short: 2,
  Reel: 3, Video: 3,
};

const BUDGET = 50; // weekly credit budget for the progress bar

interface PlatformCfg {
  name: string;
  color: string;
  types: string[];
  defaultTime: string;
}

const PLATFORM_CFG: Record<string, PlatformCfg> = {
  instagram: { name: "Instagram", color: "#E1306C", types: ["Reel", "Post", "Carousel"], defaultTime: "11:00 AM" },
  linkedin:  { name: "LinkedIn",  color: "#0A66C2", types: ["Post", "Article"],           defaultTime: "9:00 AM"  },
  twitter:   { name: "Twitter",   color: "#1DA1F2", types: ["Tweet", "Thread"],            defaultTime: "10:00 AM" },
  youtube:   { name: "YouTube",   color: "#FF0000", types: ["Video", "Short"],             defaultTime: "3:00 PM"  },
  tiktok:    { name: "TikTok",    color: "#010101", types: ["Video"],                      defaultTime: "7:00 PM"  },
  facebook:  { name: "Facebook",  color: "#1877F2", types: ["Post", "Reel"],               defaultTime: "12:00 PM" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface DaySlot {
  enabled: boolean;
  type: string;
  time: string;
}

interface PlatformSchedule {
  platform: string;
  postsPerWeek: number;
  days: DaySlot[]; // length 7, index 0=Mon … 6=Sun
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDefaultSchedule(platform: string): PlatformSchedule {
  const cfg = PLATFORM_CFG[platform] ?? { types: ["Post"], defaultTime: "10:00 AM" };
  const defaultPosts = 3;
  const enabledDays = new Set(DAY_DISTRIBUTION[defaultPosts] ?? []);
  return {
    platform,
    postsPerWeek: defaultPosts,
    days: Array.from({ length: 7 }, (_, i) => ({
      enabled: enabledDays.has(i),
      type: cfg.types[0],
      time: cfg.defaultTime,
    })),
  };
}

/** Redistribute enabled days for a new postsPerWeek, preserving existing type/time. */
function redistributeDays(schedule: PlatformSchedule, newCount: number): PlatformSchedule {
  const newEnabledSet = new Set(DAY_DISTRIBUTION[newCount] ?? []);
  return {
    ...schedule,
    postsPerWeek: newCount,
    days: schedule.days.map((slot, i) => ({
      ...slot,
      enabled: newEnabledSet.has(i),
    })),
  };
}

function creditCost(type: string) {
  return CREDIT_COST[type] ?? 1;
}

function scheduleTotalCredits(sched: PlatformSchedule): number {
  return sched.days.reduce((sum, d) => sum + (d.enabled ? creditCost(d.type) : 0), 0);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Step5Strategy() {
  const router = useRouter();
  const { product, analysis, selectedPlatforms, strategy, setStep, reset, productId } = useOnboarding();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveStep, setSaveStep] = useState<"idle" | "saving" | "generating" | "done">("idle");

  // Sort selectedPlatforms by analysis score descending; unseen platforms go last.
  const platformOrder = [...selectedPlatforms].sort((a, b) => {
    const scoreA = analysis?.platforms.find((p) => p.platform === a)?.score ?? -1;
    const scoreB = analysis?.platforms.find((p) => p.platform === b)?.score ?? -1;
    return scoreB - scoreA;
  });

  // Lazy-initialise schedules once.
  const [schedules, setSchedules] = useState<PlatformSchedule[]>(() =>
    platformOrder.map(buildDefaultSchedule)
  );

  // ── Derived ────────────────────────────────────────────────────────────────

  const totalCredits = schedules.reduce((sum, s) => sum + scheduleTotalCredits(s), 0);
  const remainingCredits = BUDGET - totalCredits;
  const barPct = Math.min(100, Math.round((totalCredits / BUDGET) * 100));

  // ── Schedule mutators ──────────────────────────────────────────────────────

  function updateSchedule(platform: string, updater: (s: PlatformSchedule) => PlatformSchedule) {
    setSchedules((prev) => prev.map((s) => (s.platform === platform ? updater(s) : s)));
  }

  function changePosts(platform: string, delta: number) {
    updateSchedule(platform, (s) => {
      const next = Math.max(1, Math.min(7, s.postsPerWeek + delta));
      return redistributeDays(s, next);
    });
  }

  function toggleDay(platform: string, dayIdx: number) {
    updateSchedule(platform, (s) => {
      const slot = s.days[dayIdx];
      const cfg = PLATFORM_CFG[platform] ?? { types: ["Post"], defaultTime: "10:00 AM" };
      const newEnabled = !slot.enabled;
      const newDays = s.days.map((d, i) =>
        i === dayIdx ? { ...d, enabled: newEnabled } : d
      );
      const newCount = newDays.filter((d) => d.enabled).length;
      return { ...s, postsPerWeek: newCount, days: newDays };
    });
  }

  function cycleType(platform: string, dayIdx: number) {
    const cfg = PLATFORM_CFG[platform] ?? { types: ["Post"], defaultTime: "10:00 AM" };
    updateSchedule(platform, (s) => {
      const slot = s.days[dayIdx];
      const types = cfg.types;
      const nextType = types[(types.indexOf(slot.type) + 1) % types.length];
      const newDays = s.days.map((d, i) => (i === dayIdx ? { ...d, type: nextType } : d));
      return { ...s, days: newDays };
    });
  }

  function changeTime(platform: string, dayIdx: number, time: string) {
    updateSchedule(platform, (s) => {
      const newDays = s.days.map((d, i) => (i === dayIdx ? { ...d, time } : d));
      return { ...s, days: newDays };
    });
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveStep("saving");

    try {
      // ── Step 1: Save product only if not already created in Step 1 ───────────
      if (!productId) {
        const res = await fetch("/api/products/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product, analysis, selectedPlatforms, strategy, schedules }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            setSaveError("You need to be logged in. Redirecting to register…");
            setTimeout(() => router.push("/register"), 1500);
          } else {
            setSaveError((data.error || "Failed to save.") + (data.detail ? ` (${data.detail})` : ""));
          }
          setSaving(false);
          setSaveStep("idle");
          return;
        }
      }

      // ── Step 2: Save schedules + generate AI content ──────────────────────────
      if (productId && analysis) {
        setSaveStep("generating");
        try {
          await fetch("/api/save-strategy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, schedules, analysis }),
          });
        } catch (err) {
          console.error("[Step5] save-strategy error:", err);
          // non-fatal — product is saved, strategy may retry later
        }
      }

      // ── Step 3: Mark product as active ───────────────────────────────────────
      if (productId) {
        fetch(`/api/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "active" }),
        }).catch(() => {});
      }

      setSaveStep("done");
      const finalProductId = productId; // capture before reset clears it
      reset();
      router.push(finalProductId ? `/dashboard/${finalProductId}` : "/projects?refresh=1");
    } catch {
      setSaveError("Network error. Please check your connection.");
      setSaving(false);
      setSaveStep("idle");
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* ── Sticky credit bar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#EAEAF4] px-8 py-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xl font-extrabold text-[#0F0E1A]">{totalCredits}</span>
            <span className="text-sm text-[#6C6C8A] ml-1.5">credits / week</span>
          </div>
          <div className="text-right">
            <span
              className={`text-xs font-semibold ${remainingCredits >= 0 ? "text-[#059669]" : "text-[#DC2626]"}`}
            >
              {remainingCredits >= 0
                ? `${remainingCredits} credits remaining`
                : `${Math.abs(remainingCredits)} credits over budget`}
            </span>
            <span className="text-[11px] text-[#9898B8] ml-1">of {BUDGET}-credit budget</span>
          </div>
        </div>
        <div className="w-full h-2 bg-[#F7F6FF] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${barPct}%`,
              background: remainingCredits >= 0 ? "#6D28D9" : "#DC2626",
            }}
          />
        </div>
      </div>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="px-8 pt-6 pb-2">
        <h1 className="text-2xl font-extrabold text-[#0F0E1A] tracking-tight mb-1">
          Content Strategy
        </h1>
        <p className="text-sm text-[#6C6C8A]">
          Customise your weekly posting schedule for each platform.
        </p>
      </div>

      {/* ── Platform cards (scrollable) ──────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-8 py-4 space-y-4">
        {schedules.map((sched) => {
          const cfg = PLATFORM_CFG[sched.platform] ?? {
            name: sched.platform,
            color: "#6D28D9",
            types: ["Post"],
            defaultTime: "10:00 AM",
          };
          const platformData = analysis?.platforms.find(
            (p) => p.platform === sched.platform
          );
          const score = platformData?.score;
          const weeklyCredits = scheduleTotalCredits(sched);

          return (
            <div
              key={sched.platform}
              className="bg-white border border-[#EAEAF4] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,.04)] overflow-hidden"
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F0F8]">
                <div className="flex items-center gap-3">
                  {/* Platform icon */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: cfg.color }}
                  >
                    {cfg.name[0]}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#0F0E1A]">{cfg.name}</span>
                    {score !== undefined && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-[#EDE9FE] text-[#6D28D9] text-[10px] font-bold rounded-full">
                        {score}% Match
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Posts/week counter */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changePosts(sched.platform, -1)}
                      disabled={sched.postsPerWeek <= 1}
                      className="w-6 h-6 rounded-md bg-[#F7F6FF] border border-[#EAEAF4] text-[#6D28D9] text-xs font-bold flex items-center justify-center hover:bg-[#EDE9FE] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold text-[#0F0E1A] w-5 text-center">
                      {sched.postsPerWeek}
                    </span>
                    <button
                      onClick={() => changePosts(sched.platform, 1)}
                      disabled={sched.postsPerWeek >= 7}
                      className="w-6 h-6 rounded-md bg-[#F7F6FF] border border-[#EAEAF4] text-[#6D28D9] text-xs font-bold flex items-center justify-center hover:bg-[#EDE9FE] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      +
                    </button>
                    <span className="text-[11px] text-[#9898B8]">posts/week</span>
                  </div>

                  {/* Weekly credit cost */}
                  <div className="text-[11px] font-semibold text-[#6D28D9] bg-[#F7F6FF] px-2.5 py-1 rounded-lg">
                    {weeklyCredits} credits/week
                  </div>
                </div>
              </div>

              {/* 7-day grid */}
              <div className="grid grid-cols-7 gap-2 p-4">
                {sched.days.map((slot, dayIdx) => {
                  if (slot.enabled) {
                    return (
                      <div
                        key={dayIdx}
                        className="relative flex flex-col gap-1.5 bg-white border border-[#6D28D9] rounded-xl p-2 cursor-default"
                        style={{ minHeight: 90 }}
                      >
                        {/* Day label */}
                        <div className="text-[10px] font-bold text-[#6D28D9] text-center">
                          {DAYS[dayIdx]}
                        </div>

                        {/* Dismiss button */}
                        <button
                          onClick={() => toggleDay(sched.platform, dayIdx)}
                          className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#EDE9FE] text-[#6D28D9] text-[9px] font-bold flex items-center justify-center hover:bg-[#6D28D9] hover:text-white transition-all leading-none"
                          title="Disable this day"
                        >
                          ×
                        </button>

                        {/* Content type pill (cycling) */}
                        <button
                          onClick={() => cycleType(sched.platform, dayIdx)}
                          className="text-[10px] font-bold text-white rounded-full px-1.5 py-0.5 truncate text-center transition-opacity hover:opacity-80"
                          style={{ background: cfg.color }}
                          title="Click to change type"
                        >
                          {slot.type}
                        </button>

                        {/* Time selector */}
                        <select
                          value={slot.time}
                          onChange={(e) => changeTime(sched.platform, dayIdx, e.target.value)}
                          className="w-full text-[10px] text-[#6C6C8A] bg-[#F7F6FF] border border-[#EAEAF4] rounded-lg px-1 py-0.5 appearance-none text-center cursor-pointer focus:outline-none focus:border-[#6D28D9]"
                        >
                          {TIMES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>

                        {/* Credit badge */}
                        <div className="text-center text-[9px] text-[#9898B8] font-medium">
                          {creditCost(slot.type)} cr
                        </div>
                      </div>
                    );
                  }

                  // Disabled cell
                  return (
                    <button
                      key={dayIdx}
                      onClick={() => toggleDay(sched.platform, dayIdx)}
                      className="flex flex-col items-center justify-center gap-1 bg-[#F7F6FF] border border-dashed border-[#C8C8E0] rounded-xl p-2 hover:border-[#6D28D9] hover:bg-[#F3F0FE] transition-all group"
                      style={{ minHeight: 90 }}
                      title="Click to enable this day"
                    >
                      <div className="text-[10px] font-semibold text-[#9898B8] group-hover:text-[#6D28D9]">
                        {DAYS[dayIdx]}
                      </div>
                      <div className="text-[10px] text-[#C8C8E0] group-hover:text-[#6D28D9]">Off</div>
                      <div className="text-[9px] text-[#C8C8E0] group-hover:text-[#6D28D9]">+ add</div>
                    </button>
                  );
                })}
              </div>

              {/* Credit legend */}
              <div className="px-4 pb-3 flex items-center gap-3 flex-wrap">
                {cfg.types.map((t) => (
                  <span key={t} className="text-[10px] text-[#9898B8]">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1"
                      style={{ background: cfg.color, opacity: 0.7 }}
                    />
                    {t} · {creditCost(t)} cr
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────────── */}
      <div className="px-8 py-5 border-t border-[#EAEAF4] bg-white">
        {saveError && (
          <div className="mb-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600">
            {saveError}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep(4)}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-[#6C6C8A] border border-[#C8C8E0] rounded-xl hover:text-[#0F0E1A] hover:border-[#9898B8] transition-all disabled:opacity-50"
          >
            ← Back
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#6D28D9] text-white text-sm font-semibold rounded-xl hover:bg-[#5B21B6] hover:shadow-[0_6px_20px_rgba(109,40,217,.35)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity=".3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                {saveStep === "generating" ? "Generating content…" : "Saving…"}
              </>
            ) : (
              "Save & Start Generating Content →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
