"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduledPost {
  id: string;
  platform: string;
  content_type: string;
  content_text: string;
  content_image_url?: string;
  scheduled_at: string;
  status: string;
  platform_record_id?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C", linkedin: "#0A66C2", twitter: "#000000",
  youtube:   "#FF0000", tiktok:   "#010101", facebook: "#1877F2",
};

const PLATFORM_NAMES: Record<string, string> = {
  instagram: "Instagram", linkedin: "LinkedIn", twitter: "Twitter",
  youtube:   "YouTube",   tiktok:   "TikTok",   facebook: "Facebook",
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Reel:     { bg: "#EDE9FE", text: "#6D28D9" },
  Post:     { bg: "#DBEAFE", text: "#0A66C2" },
  Carousel: { bg: "#FEE2E2", text: "#DC2626" },
  Tweet:    { bg: "#F0F9FF", text: "#0369A1" },
  Thread:   { bg: "#FEF3C7", text: "#D97706" },
  Article:  { bg: "#D1FAE5", text: "#059669" },
  Video:    { bg: "#FEE2E2", text: "#DC2626" },
  Short:    { bg: "#EDE9FE", text: "#6D28D9" },
};

function parseInputDate(str: string) {
  try {
    const d = new Date(str.replace(" ", "T") + (str.includes("T") ? "" : "Z"));
    return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
  } catch { return ""; }
}

function parseInputTime(str: string) {
  try {
    const d = new Date(str.replace(" ", "T") + (str.includes("T") ? "" : "Z"));
    return d.toTimeString().slice(0, 5); // "HH:MM"
  } catch { return ""; }
}

function toMysqlDatetime(date: string, time: string) {
  return `${date} ${time}:00`;
}

function fmtDate(str: string) {
  try {
    const d = new Date(str.replace(" ", "T") + (str.includes("T") ? "" : "Z"));
    const now = new Date();
    const tom = new Date(now); tom.setDate(now.getDate() + 1);
    if (d.toDateString() === now.toDateString()) return "Today";
    if (d.toDateString() === tom.toDateString()) return "Tomorrow";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch { return str; }
}

function fmtTime(str: string) {
  try {
    const d = new Date(str.replace(" ", "T") + (str.includes("T") ? "" : "Z"));
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } catch { return ""; }
}

const TEXT_ONLY_TYPES = new Set(["Post", "Article", "Tweet", "Thread"]);

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" strokeDasharray="28" strokeDashoffset="10" />
    </svg>
  );
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  platformColor,
  onSave,
  onRegenText,
  onRegenImage,
  onPublish,
}: {
  post: ScheduledPost;
  platformColor: string;
  onSave: (id: string, fields: Record<string, string>) => Promise<void>;
  onRegenText: (id: string) => Promise<string | null>;
  onRegenImage: (id: string) => Promise<string | null>;
  onPublish: (id: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const [text, setText]         = useState(post.content_text);
  const [imageUrl, setImageUrl] = useState(post.content_image_url ?? "");
  const [isDirty, setIsDirty]   = useState(false);
  const [disabled, setDisabled] = useState(post.status === "DISABLED");

  // Date/time state
  const [schedDate, setSchedDate]       = useState(parseInputDate(post.scheduled_at));
  const [schedTime, setSchedTime]       = useState(parseInputTime(post.scheduled_at));
  const [dateDirty, setDateDirty]       = useState(false);
  const [dateSaving, setDateSaving]     = useState(false);
  const [dateSaved, setDateSaved]       = useState(false);

  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [regenTxtLoading, setRegenTxtLoading] = useState(false);
  const [regenImgLoading, setRegenImgLoading] = useState(false);
  const [togglingDisable, setTogglingDisable] = useState(false);
  const [pubLoading, setPubLoading]     = useState(false);
  const [pubDone, setPubDone]           = useState(post.status === "PUBLISHED");
  const [pubError, setPubError]         = useState("");

  const handleTextChange = (v: string) => {
    setText(v);
    setIsDirty(v !== post.content_text);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(post.id, { content_text: text });
    setSaving(false);
    setSaved(true);
    setIsDirty(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleToggleDisable = async () => {
    setTogglingDisable(true);
    const newStatus = disabled ? "READY" : "DISABLED";
    await onSave(post.id, { status: newStatus });
    setDisabled(!disabled);
    setTogglingDisable(false);
  };

  const handleSaveDate = async () => {
    if (!schedDate || !schedTime) return;
    setDateSaving(true);
    await onSave(post.id, { scheduled_at: toMysqlDatetime(schedDate, schedTime) });
    setDateSaving(false);
    setDateSaved(true);
    setDateDirty(false);
    setTimeout(() => setDateSaved(false), 2500);
  };

  const handleRegenText = async () => {
    setRegenTxtLoading(true);
    const newText = await onRegenText(post.id);
    setRegenTxtLoading(false);
    if (newText) {
      setText(newText);
      setIsDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleRegenImage = async () => {
    setRegenImgLoading(true);
    const url = await onRegenImage(post.id);
    setRegenImgLoading(false);
    if (url) setImageUrl(url);
  };

  const handlePublish = async () => {
    setPubLoading(true);
    setPubError("");
    const result = await onPublish(post.id);
    setPubLoading(false);
    if (result.success) {
      setPubDone(true);
    } else {
      setPubError(result.error ?? "Publish failed");
    }
  };

  const typeStyle    = TYPE_COLORS[post.content_type] ?? { bg: "#F7F6FF", text: "#3D3D5C" };
  const isPublished  = pubDone || post.status === "PUBLISHED";
  // Text-only layout: text-type post with no image → single full-width column
  const isTextLayout = TEXT_ONLY_TYPES.has(post.content_type) && !imageUrl;

  // Shared: bottom action bar (same in both layouts)
  const actionBar = (
    <>
      {/* Date / time editor */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#EAEAF4]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-[#9898B8]">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        <input
          type="date"
          value={schedDate}
          onChange={(e) => { setSchedDate(e.target.value); setDateDirty(true); setDateSaved(false); }}
          className="text-xs text-[#0F0E1A] border border-[#EAEAF4] rounded-lg px-2 py-1 focus:outline-none focus:border-[#6D28D9] transition-all bg-white"
        />
        <input
          type="time"
          value={schedTime}
          onChange={(e) => { setSchedTime(e.target.value); setDateDirty(true); setDateSaved(false); }}
          className="text-xs text-[#0F0E1A] border border-[#EAEAF4] rounded-lg px-2 py-1 focus:outline-none focus:border-[#6D28D9] transition-all bg-white"
        />
        <button
          onClick={handleSaveDate}
          disabled={dateSaving || !dateDirty}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            dateSaved
              ? "bg-[#D1FAE5] text-[#059669]"
              : dateDirty
              ? "bg-[#6D28D9] text-white hover:bg-[#5B21B6]"
              : "bg-[#F7F6FF] text-[#9898B8] cursor-not-allowed"
          }`}
        >
          {dateSaving ? <Spinner size={9} /> : dateSaved ? (
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/></svg>
          ) : null}
          {dateSaving ? "Saving…" : dateSaved ? "Saved" : "Update"}
        </button>
      </div>

      {/* Buttons row */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#EAEAF4]">
        <button
          onClick={handleRegenText}
          disabled={regenTxtLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#EDE9FE] text-[#6D28D9] hover:bg-[#DDD6FE] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {regenTxtLoading ? <><Spinner size={10} color="#6D28D9" />Rewriting…</> : <>✨ Regenerate Text</>}
        </button>

        {!isPublished && (
          <button
            onClick={handlePublish}
            disabled={pubLoading || disabled}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#059669] text-white hover:bg-[#047857] transition-all disabled:opacity-60 disabled:cursor-not-allowed ml-auto"
          >
            {pubLoading ? <><Spinner size={10} color="white" />Publishing…</> : <>🚀 Publish Now</>}
          </button>
        )}
        {isPublished && (
          <span className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#D1FAE5] text-[#059669] ml-auto">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Published
          </span>
        )}
      </div>

      {pubError && (
        <div className="text-xs text-red-600 font-medium bg-red-50 rounded-lg px-3 py-2">{pubError}</div>
      )}
    </>
  );

  // Shared: text editor + char count + save
  const textEditor = (fullWidth: boolean) => (
    <>
      <textarea
        className="w-full text-sm text-[#0F0E1A] bg-[#FAFAFE] border border-[#EAEAF4] rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/10 transition-all leading-relaxed"
        style={{ minHeight: fullWidth ? 130 : 150 }}
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="Post content…"
      />
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#9898B8]">{text.length} chars</span>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              onClick={() => { setText(post.content_text); setIsDirty(false); setSaved(false); }}
              className="text-xs text-[#9898B8] hover:text-[#6C6C8A] transition-colors"
            >
              Discard
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || (!isDirty && !saved)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              saved ? "bg-[#D1FAE5] text-[#059669]"
              : isDirty ? "bg-[#6D28D9] text-white hover:bg-[#5B21B6]"
              : "bg-[#F7F6FF] text-[#9898B8] cursor-not-allowed"
            }`}
          >
            {saving ? <><Spinner size={10} />Saving…</>
              : saved ? <><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/></svg>Saved</>
              : "Save changes"}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div
      className="bg-white rounded-2xl border shadow-[0_2px_8px_rgba(0,0,0,.04)] overflow-hidden transition-opacity"
      style={{ borderColor: disabled ? "#E5E7EB" : "#EAEAF4", opacity: disabled ? 0.6 : 1 }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#EAEAF4] bg-[#FAFAFE]">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full" style={{ background: typeStyle.bg, color: typeStyle.text }}>
            {post.content_type}
          </span>
          <span className="text-xs text-[#6C6C8A] font-medium">
            {dateSaved || dateDirty
              ? `${new Date(`${schedDate}T${schedTime}`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${new Date(`${schedDate}T${schedTime}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
              : `${fmtDate(post.scheduled_at)} · ${fmtTime(post.scheduled_at)}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isPublished && (
            <button
              onClick={handleToggleDisable}
              disabled={togglingDisable}
              className="flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              title={disabled ? "Enable post" : "Disable post"}
            >
              <span className="text-[10px] font-medium text-[#9898B8]">{disabled ? "Off" : "On"}</span>
              <span
                className="relative inline-flex w-8 h-[18px] rounded-full transition-colors duration-200 flex-shrink-0"
                style={{ background: togglingDisable ? "#C4B5FD" : disabled ? "#D1D5DB" : "#6D28D9" }}
              >
                <span
                  className="absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-transform duration-200"
                  style={{ transform: disabled ? "translateX(2px)" : "translateX(18px)" }}
                />
              </span>
            </button>
          )}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
            isPublished ? "bg-[#D1FAE5] text-[#059669]"
            : disabled ? "bg-[#F3F4F6] text-[#9898B8]"
            : "bg-[#EDE9FE] text-[#6D28D9]"
          }`}>
            {isPublished ? "● Published" : disabled ? "○ Disabled" : "● Scheduled"}
          </span>
        </div>
      </div>

      {/* ── TEXT-ONLY layout (Post / Article / Tweet / Thread with no image) ── */}
      {isTextLayout ? (
        <div className="p-5 flex flex-col gap-3">
          {textEditor(true)}
          {/* Optional image strip */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#EAEAF4]">
            <span className="text-[11px] text-[#9898B8] font-medium">Add image (optional)</span>
            <button
              onClick={handleRegenImage}
              disabled={regenImgLoading}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border border-[#EAEAF4] text-[#6C6C8A] hover:border-[#6D28D9] hover:text-[#6D28D9] transition-all disabled:opacity-60"
            >
              {regenImgLoading ? <><Spinner size={10} />Generating…</> : <>🎨 Generate Image</>}
            </button>
          </div>
          {actionBar}
        </div>
      ) : (
        /* ── IMAGE layout (Reel / Carousel / Video / Short, or text post that already has an image) ── */
        <div className="grid grid-cols-[280px_1fr] divide-x divide-[#EAEAF4]">
          {/* Left: image panel */}
          <div className="p-4 flex flex-col gap-3">
            <div
              className="rounded-xl overflow-hidden flex items-center justify-center"
              style={{
                minHeight: 180,
                background: imageUrl ? undefined : `linear-gradient(135deg, ${platformColor}15, ${platformColor}08)`,
                border: imageUrl ? "none" : `1.5px dashed ${platformColor}40`,
              }}
            >
              {regenImgLoading ? (
                <div className="flex flex-col items-center gap-2 p-6">
                  <Spinner size={28} color={platformColor} />
                  <span className="text-xs font-semibold" style={{ color: platformColor }}>Generating image…</span>
                </div>
              ) : imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={imageUrl} alt="Post image" className="w-full object-cover" style={{ maxHeight: 220 }} />
              ) : (
                <div className="flex flex-col items-center gap-2 p-6 text-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke={platformColor} strokeWidth="1.5" opacity=".4"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill={platformColor} opacity=".4"/>
                    <path d="M21 15l-5-5L5 21" stroke={platformColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".4"/>
                  </svg>
                  <span className="text-xs text-[#9898B8]">No image yet</span>
                </div>
              )}
            </div>
            <button
              onClick={handleRegenImage}
              disabled={regenImgLoading}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl border-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ borderColor: platformColor, color: platformColor, background: regenImgLoading ? `${platformColor}10` : "white" }}
              onMouseEnter={(e) => { if (!regenImgLoading) (e.currentTarget as HTMLButtonElement).style.background = `${platformColor}10`; }}
              onMouseLeave={(e) => { if (!regenImgLoading) (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
            >
              {regenImgLoading
                ? <><Spinner size={11} />{imageUrl ? "Regenerating…" : "Generating…"}</>
                : <>{imageUrl ? "🔄 Regenerate Image" : "🎨 Generate Image"}</>}
            </button>
          </div>

          {/* Right: text editor + actions */}
          <div className="p-4 flex flex-col gap-3">
            {textEditor(false)}
            {actionBar}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PostsEditPage() {
  const params     = useParams();
  const router     = useRouter();
  const productId  = params.productId as string;
  const platformSlug = params.platform as string;

  const [posts,   setPosts]   = useState<ScheduledPost[]>([]);
  const [product, setProduct] = useState<{ id: string; product_name: string } | null>(null);
  const [platformUsername, setPlatformUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const color = PLATFORM_COLORS[platformSlug] ?? "#6D28D9";
  const name  = PLATFORM_NAMES[platformSlug]  ?? platformSlug;

  useEffect(() => {
    if (!productId || !platformSlug) return;
    Promise.all([
      fetch(`/api/products/${productId}`).then((r) => r.json()),
      fetch(`/api/product-platforms?productId=${productId}`).then((r) => r.json()),
      fetch(`/api/scheduled-posts?productId=${productId}`).then((r) => r.json()),
    ])
      .then(([prod, plat, sched]) => {
        if (prod.product) setProduct(prod.product);
        if (plat.platforms) {
          const pl = plat.platforms.find((p: { platform: string; platform_username?: string }) => p.platform === platformSlug);
          if (pl?.platform_username) setPlatformUsername(pl.platform_username);
        }
        if (sched.posts) {
          setPosts(
            sched.posts
              .filter((p: ScheduledPost) => p.platform === platformSlug)
              .sort((a: ScheduledPost, b: ScheduledPost) =>
                String(a.scheduled_at).localeCompare(String(b.scheduled_at))
              )
          );
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId, platformSlug]);

  const handleSave = useCallback(async (postId: string, fields: Record<string, string>) => {
    const res = await fetch(`/api/scheduled-posts/${postId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(fields),
    });
    if (res.ok) {
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, ...fields } : p));
    }
  }, []);

  const handleRegenText = useCallback(async (postId: string): Promise<string | null> => {
    const res = await fetch(`/api/scheduled-posts/${postId}/regenerate-text`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.success && data.content_text) {
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, content_text: data.content_text } : p));
      return data.content_text;
    }
    return null;
  }, []);

  const handleRegenImage = useCallback(async (postId: string): Promise<string | null> => {
    const res = await fetch("/api/generate-image", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ postId }),
    });
    const data = await res.json();
    if (data.success && data.imageUrl) {
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, content_image_url: data.imageUrl } : p));
      return data.imageUrl;
    }
    return null;
  }, []);

  const handlePublish = useCallback(async (postId: string) => {
    const res = await fetch("/api/publish-now", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ postId }),
    });
    const data = await res.json();
    if (data.success) {
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, status: "PUBLISHED" } : p));
      return { success: true };
    }
    return { success: false, error: data.error ?? "Publish failed" };
  }, []);

  const readyCount     = posts.filter((p) => p.status === "READY").length;
  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;
  const withImages     = posts.filter((p) => p.content_image_url).length;

  return (
    <div className="max-w-[900px] space-y-5">
      {/* ── Breadcrumb / Back nav ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-[#9898B8]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 font-semibold text-[#6D28D9] hover:underline"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <span>/</span>
        <span>{product?.product_name ?? "Dashboard"}</span>
        <span>/</span>
        <span className="font-semibold text-[#0F0E1A]">{name}</span>
      </div>

      {/* ── Platform header ─────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl border border-[#EAEAF4] p-5 shadow-[0_2px_8px_rgba(0,0,0,.04)]"
        style={{ background: `linear-gradient(145deg, ${color}06, ${color}12)` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl flex-shrink-0"
              style={{ background: color }}
            >
              {name[0]}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#0F0E1A]">{name}</h1>
              {platformUsername && (
                <p className="text-sm text-[#9898B8]">@{platformUsername}</p>
              )}
              <p className="text-xs text-[#6C6C8A] mt-0.5">
                This week&apos;s content — edit, regenerate, or publish any post below
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 bg-white rounded-xl border border-[#EAEAF4]">
              <div className="text-2xl font-extrabold text-[#0F0E1A]">{posts.length}</div>
              <div className="text-[10px] text-[#9898B8] font-medium">Total</div>
            </div>
            <div className="text-center px-4 py-2 bg-[#D1FAE5] rounded-xl">
              <div className="text-2xl font-extrabold text-[#059669]">{publishedCount}</div>
              <div className="text-[10px] text-[#6C6C8A] font-medium">Published</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Posts list ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#EAEAF4] h-64 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#C8C8E0] p-12 text-center">
          <div className="w-16 h-16 bg-[#EDE9FE] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="#6D28D9" strokeWidth="1.6"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-sm font-bold text-[#0F0E1A] mb-1">No posts scheduled</div>
          <div className="text-xs text-[#9898B8]">
            AI will generate and schedule posts for {name} once your strategy is active.
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, idx) => (
            <div key={post.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-[#9898B8]">Post {idx + 1} of {posts.length}</span>
                <div className="flex-1 h-px bg-[#EAEAF4]" />
              </div>
              <PostCard
                post={post}
                platformColor={color}
                onSave={handleSave}
                onRegenText={handleRegenText}
                onRegenImage={handleRegenImage}
                onPublish={handlePublish}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
