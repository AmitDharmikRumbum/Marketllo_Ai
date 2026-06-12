"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  product_name: string;
  website_url: string;
  product_desc?: string;
}

interface Platform {
  id: string;
  platform: string;
  status: string;
  platform_username?: string;
  priority_score?: string;
}

interface ScheduledPost {
  id: string;
  platform: string;
  content_type: string;
  content_text: string;
  content_image_url?: string;
  scheduled_at: string;
  status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C", linkedin: "#0A66C2", twitter: "#000000",
  youtube:   "#FF0000", tiktok:   "#010101", facebook: "#1877F2",
};

const PLATFORM_NAMES: Record<string, string> = {
  instagram: "Instagram", linkedin: "LinkedIn", twitter: "Twitter",
  youtube:   "YouTube",   tiktok:   "TikTok",   facebook: "Facebook",
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Reel:    { bg: "#EDE9FE", text: "#6D28D9" },
  Post:    { bg: "#DBEAFE", text: "#0A66C2" },
  Carousel:{ bg: "#FEE2E2", text: "#DC2626" },
  Tweet:   { bg: "#F0F9FF", text: "#0369A1" },
  Thread:  { bg: "#FEF3C7", text: "#D97706" },
  Article: { bg: "#D1FAE5", text: "#059669" },
  Video:   { bg: "#FEE2E2", text: "#DC2626" },
  Short:   { bg: "#EDE9FE", text: "#6D28D9" },
};

function stringToColor(s: string) {
  const c = ["#6D28D9","#0A66C2","#E1306C","#059669","#D97706","#DC2626"];
  let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return c[Math.abs(h) % c.length];
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

// ─── Platform card ─────────────────────────────────────────────────────────────

function PlatformCard({
  platform, posts, username, score, imgLoading, onClick, onToggleDisable,
}: {
  platform: Platform;
  posts: ScheduledPost[];
  username?: string;
  score?: string;
  imgLoading?: boolean;
  onClick: () => void;
  onToggleDisable: (platformId: string, newStatus: string) => Promise<void>;
}) {
  const color        = PLATFORM_COLORS[platform.platform] ?? "#6D28D9";
  const name         = PLATFORM_NAMES[platform.platform]  ?? platform.platform;
  const readyPosts   = posts.filter((p) => p.status === "READY" && platform.status !== "DISABLED").length;
  const isDisabled   = platform.status === "DISABLED";
  const isConnected  = platform.status === "CONNECTED";
  const [toggling, setToggling] = useState(false);

  // Pick the first post that already has an image for the preview thumbnail
  const previewPost  = posts.find((p) => p.content_image_url) ?? posts[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleToggle = async (e: any) => {
    e.stopPropagation();
    setToggling(true);
    const newStatus = isDisabled ? "CONNECTED" : "DISABLED";
    await onToggleDisable(platform.id, newStatus);
    setToggling(false);
  };

  return (
    <div
      className="group w-full text-left bg-white rounded-2xl border shadow-[0_2px_8px_rgba(0,0,0,.04)] overflow-hidden"
      style={{ borderColor: isDisabled ? "#E5E7EB" : "#EAEAF4" }}
    >
      {/* Image loading banner */}
      {imgLoading && !isDisabled && (
        <div className="flex items-center gap-2 px-4 py-2 text-[11px] font-semibold"
          style={{ background: `${color}18`, color }}>
          <svg className="animate-spin flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="28" strokeDashoffset="10"/>
          </svg>
          Generating images for this week…
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0"
              style={{ background: isDisabled ? "#9CA3AF" : color }}>
              {name[0]}
            </div>
            <div>
              <div className="text-sm font-bold text-[#0F0E1A]">{name}</div>
              {username && <div className="text-xs text-[#9898B8]">@{username}</div>}
            </div>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
            isDisabled ? "bg-[#F3F4F6] text-[#9898B8]"
            : isConnected ? "bg-[#D1FAE5] text-[#059669]"
            : "bg-[#FEF3C7] text-[#D97706]"
          }`}>
            {isDisabled ? "Disabled" : isConnected ? "Connected" : "Pending"}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-[#F7F6FF] rounded-xl p-2.5 text-center">
            <div className="text-lg font-extrabold text-[#0F0E1A]">{posts.length}</div>
            <div className="text-[10px] text-[#9898B8] font-medium">Posts</div>
          </div>
          <div className="bg-[#F7F6FF] rounded-xl p-2.5 text-center">
            <div className="text-lg font-extrabold text-[#059669]">{readyPosts}</div>
            <div className="text-[10px] text-[#9898B8] font-medium">Ready</div>
          </div>
        </div>

        {/* Next post preview (image if available, else text) */}
        {previewPost?.content_image_url ? (
          <div className="rounded-xl overflow-hidden mb-3 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewPost.content_image_url}
              alt="Post preview"
              className="w-full h-24 object-cover"
            />
            {imgLoading && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl">
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2.5" strokeDasharray="28" strokeDashoffset="10"/>
                </svg>
              </div>
            )}
          </div>
        ) : previewPost ? (
          <div className="rounded-xl border border-[#EAEAF4] px-3 py-2 text-xs text-[#6C6C8A] line-clamp-2 mb-3 min-h-[40px] flex items-center"
            style={{ background: imgLoading ? `${color}08` : undefined }}>
            {imgLoading ? (
              <span className="flex items-center gap-2" style={{ color }}>
                <svg className="animate-spin flex-shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="28" strokeDashoffset="10"/>
                </svg>
                Creating AI image…
              </span>
            ) : (
              previewPost.content_text?.slice(0, 90) + "…"
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#C8C8E0] px-3 py-2 text-xs text-[#9898B8] mb-3 text-center">
            No posts scheduled yet
          </div>
        )}

        {/* Auto-publish toggle row */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-3"
          style={{ background: isDisabled ? "#F3F4F6" : `${color}0D` }}>
          <div className="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ color: isDisabled ? "#9898B8" : color }}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[11px] font-semibold" style={{ color: isDisabled ? "#9898B8" : "#3D3D5C" }}>
              Auto-publish
            </span>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className="flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {toggling && (
              <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ color: isDisabled ? "#9898B8" : color }}>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="28" strokeDashoffset="10"/>
              </svg>
            )}
            <span className="text-[10px] font-bold" style={{ color: isDisabled ? "#9898B8" : color }}>
              {isDisabled ? "OFF" : "ON"}
            </span>
            {/* Toggle pill */}
            <span
              className="relative inline-flex w-10 h-5 rounded-full transition-all duration-300"
              style={{ background: toggling ? "#C4B5FD" : isDisabled ? "#D1D5DB" : color }}
            >
              <span
                className="absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full shadow transition-all duration-300"
                style={{ left: isDisabled ? "3px" : "calc(100% - 17px)" }}
              />
            </span>
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={onClick}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[.98]"
          style={{ background: isDisabled ? "#9CA3AF" : color }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="white" strokeWidth="1.6"/><path d="M16 2v4M8 2v4M3 10h18" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
          View &amp; Edit This Week
        </button>
      </div>
    </div>
  );
}

// ─── Posts panel (slide-over) ─────────────────────────────────────────────────

function PostsPanel({
  platform, posts, onClose, onSave, onImageGenerated, onPublished,
}: {
  platform: Platform | null;
  posts: ScheduledPost[];
  onClose: () => void;
  onSave: (id: string, text: string) => Promise<void>;
  onImageGenerated?: (id: string, imageUrl: string) => void;
  onPublished?: (id: string) => void;
}) {
  const [edits,        setEdits]        = useState<Record<string, string>>({});
  const [saving,       setSaving]       = useState<Record<string, boolean>>({});
  const [saved,        setSaved]        = useState<Record<string, boolean>>({});
  // Image generation state
  const [genLoading,   setGenLoading]   = useState<Record<string, boolean>>({});
  const [genImages,    setGenImages]    = useState<Record<string, string>>({});
  // Publish state
  const [pubLoading,   setPubLoading]   = useState<Record<string, boolean>>({});
  const [pubDone,      setPubDone]      = useState<Record<string, boolean>>({});
  const [pubError,     setPubError]     = useState<Record<string, string>>({});

  // Reset state when panel opens for a different platform
  useEffect(() => {
    setEdits({});
    setSaved({});
    setGenImages({});
    setPubDone({});
    setPubError({});
  }, [platform?.platform]);

  if (!platform) return null;

  const color = PLATFORM_COLORS[platform.platform] ?? "#6D28D9";
  const name  = PLATFORM_NAMES[platform.platform]  ?? platform.platform;

  const handleSave = async (post: ScheduledPost) => {
    const text = edits[post.id] ?? post.content_text;
    setSaving((s) => ({ ...s, [post.id]: true }));
    await onSave(post.id, text);
    setSaving((s) => ({ ...s, [post.id]: false }));
    setSaved((s)  => ({ ...s, [post.id]: true  }));
    setTimeout(() => setSaved((s) => ({ ...s, [post.id]: false })), 2000);
  };

  const handleGenerateImage = async (post: ScheduledPost) => {
    setGenLoading((s) => ({ ...s, [post.id]: true }));
    try {
      const res  = await fetch("/api/generate-image", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ postId: post.id }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        const url = data.imageUrl.startsWith("/api/og/")
          ? `${data.imageUrl}?t=${Date.now()}`
          : data.imageUrl;
        setGenImages((s) => ({ ...s, [post.id]: url }));
        onImageGenerated?.(post.id, data.imageUrl);
      }
    } catch (err) {
      console.error("[PostsPanel] generate-image error:", err);
    } finally {
      setGenLoading((s) => ({ ...s, [post.id]: false }));
    }
  };

  const handlePublish = async (post: ScheduledPost) => {
    setPubLoading((s) => ({ ...s, [post.id]: true }));
    setPubError((s)   => ({ ...s, [post.id]: "" }));
    try {
      const res  = await fetch("/api/publish-now", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ postId: post.id }),
      });
      const data = await res.json();
      if (data.success) {
        setPubDone((s) => ({ ...s, [post.id]: true }));
        onPublished?.(post.id);
      } else {
        setPubError((s) => ({ ...s, [post.id]: data.error ?? "Publish failed" }));
      }
    } catch (err) {
      console.error("[PostsPanel] publish-now error:", err);
      setPubError((s) => ({ ...s, [post.id]: "Network error" }));
    } finally {
      setPubLoading((s) => ({ ...s, [post.id]: false }));
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[520px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Panel header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#EAEAF4]">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-base flex-shrink-0"
            style={{ background: color }}
          >
            {name[0]}
          </div>
          <div className="flex-1">
            <div className="text-sm font-extrabold text-[#0F0E1A]">{name} — This Week&apos;s Posts</div>
            <div className="text-xs text-[#9898B8]">{posts.length} post{posts.length !== 1 ? "s" : ""} scheduled · Click any post to edit</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#F7F6FF] flex items-center justify-center hover:bg-[#EDE9FE] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#6C6C8A" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Posts list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-14 h-14 bg-[#EDE9FE] rounded-2xl flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#6D28D9" strokeWidth="1.6"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </div>
              <div className="text-sm font-bold text-[#0F0E1A] mb-1">No posts yet</div>
              <div className="text-xs text-[#9898B8]">AI will schedule posts here once content is generated.</div>
            </div>
          ) : (
            posts.map((post) => {
              const typeStyle = TYPE_COLORS[post.content_type] ?? { bg: "#F7F6FF", text: "#3D3D5C" };
              const isDirty = edits[post.id] !== undefined && edits[post.id] !== post.content_text;
              return (
                <div key={post.id} className="bg-[#F7F6FF] rounded-2xl border border-[#EAEAF4] overflow-hidden">
                  {/* Post header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-[#EAEAF4]">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold rounded-full"
                        style={{ background: typeStyle.bg, color: typeStyle.text }}
                      >
                        {post.content_type}
                      </span>
                      <span className="text-xs text-[#6C6C8A]">
                        {fmtDate(post.scheduled_at)} · {fmtTime(post.scheduled_at)}
                      </span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      post.status === "PUBLISHED"
                        ? "bg-[#D1FAE5] text-[#059669]"
                        : "bg-[#EDE9FE] text-[#6D28D9]"
                    }`}>
                      {post.status === "PUBLISHED" ? "Published" : "Scheduled"}
                    </span>
                  </div>

                  {/* Editable content */}
                  <div className="p-4">
                    <textarea
                      className="w-full text-sm text-[#0F0E1A] bg-white border border-[#EAEAF4] rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/10 transition-all leading-relaxed min-h-[100px]"
                      value={edits[post.id] ?? post.content_text}
                      onChange={(e) => setEdits((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Post content…"
                    />

                    {/* Image preview — show generated or existing */}
                    {(genImages[post.id] || post.content_image_url) && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-[#EAEAF4]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={genImages[post.id] ?? (post.content_image_url?.startsWith("/api/og/") ? `${post.content_image_url}?t=init` : post.content_image_url)}
                          alt="Post image"
                          className="w-full object-cover max-h-48"
                        />
                      </div>
                    )}

                    {/* Save actions row */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-[#9898B8]">
                        {(edits[post.id] ?? post.content_text).length} chars
                      </span>
                      <div className="flex items-center gap-2">
                        {isDirty && (
                          <button
                            onClick={() => setEdits((prev) => { const n = { ...prev }; delete n[post.id]; return n; })}
                            className="text-xs text-[#9898B8] hover:text-[#6C6C8A] transition-colors"
                          >
                            Discard
                          </button>
                        )}
                        <button
                          onClick={() => handleSave(post)}
                          disabled={saving[post.id] || (!isDirty && !saved[post.id])}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                            saved[post.id]
                              ? "bg-[#D1FAE5] text-[#059669]"
                              : isDirty
                              ? "bg-[#6D28D9] text-white hover:bg-[#5B21B6]"
                              : "bg-[#F7F6FF] text-[#9898B8] cursor-not-allowed"
                          }`}
                        >
                          {saving[post.id] ? (
                            <><svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10"/></svg>Saving…</>
                          ) : saved[post.id] ? (
                            <><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/></svg>Saved</>
                          ) : (
                            "Save changes"
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Generate Image + Publish Now row */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#EAEAF4]">
                      {/* Generate Image button */}
                      <button
                        onClick={() => handleGenerateImage(post)}
                        disabled={genLoading[post.id]}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-[#6D28D9] text-[#6D28D9] hover:bg-[#EDE9FE] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {genLoading[post.id] ? (
                          <><svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10"/></svg>Generating…</>
                        ) : (
                          <>🎨 Generate Image</>
                        )}
                      </button>

                      {/* Publish Now button */}
                      {post.status !== "PUBLISHED" && !pubDone[post.id] && (
                        <button
                          onClick={() => handlePublish(post)}
                          disabled={pubLoading[post.id]}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#059669] text-white hover:bg-[#047857] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {pubLoading[post.id] ? (
                            <><svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10"/></svg>Publishing…</>
                          ) : (
                            <>🚀 Publish Now</>
                          )}
                        </button>
                      )}

                      {/* Published success state */}
                      {(post.status === "PUBLISHED" || pubDone[post.id]) && (
                        <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#D1FAE5] text-[#059669]">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          Published!
                        </span>
                      )}
                    </div>

                    {/* Publish error */}
                    {pubError[post.id] && (
                      <div className="mt-2 text-xs text-red-600 font-medium">
                        {pubError[post.id]}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function ProductDashboardPage() {
  const params    = useParams();
  const router    = useRouter();
  const productId = params.productId as string;

  const [product,  setProduct]  = useState<Product | null>(null);
  const [platforms,setPlatforms]= useState<Platform[]>([]);
  const [posts,    setPosts]    = useState<ScheduledPost[]>([]);
  const [user,     setUser]     = useState<{ name: string } | null>(null);
  const [loading,  setLoading]  = useState(true);

  // Per-platform image generation loading state
  // key = platform name, value = "loading" | "done"
  const [imgGenState, setImgGenState] = useState<Record<string, "loading" | "done">>({});


  // ── Load all data on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!productId) return;
    Promise.all([
      fetch(`/api/products/${productId}`).then((r) => r.json()),
      fetch(`/api/product-platforms?productId=${productId}`).then((r) => r.json()),
      fetch(`/api/auth/me`).then((r) => r.json()),
      fetch(`/api/scheduled-posts?productId=${productId}`).then((r) => r.json()),
    ])
      .then(([prod, plat, me, sched]) => {
        if (prod.product)   setProduct(prod.product);
        if (plat.platforms) setPlatforms(plat.platforms);
        if (me.user)        setUser(me.user);
        if (sched.posts)    setPosts(sched.posts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  // ── Auto-generate images for posts that don't have one yet ─────────────────
  useEffect(() => {
    if (loading || posts.length === 0) return;

    const postsNeedingImages = posts.filter(
      (p) => p.status === "READY" && !p.content_image_url
    );
    if (postsNeedingImages.length === 0) return;

    // Mark each affected platform as loading
    const affectedPlatforms = [...new Set(postsNeedingImages.map((p) => p.platform))];
    setImgGenState((prev) => {
      const next = { ...prev };
      affectedPlatforms.forEach((pl) => { if (!next[pl]) next[pl] = "loading"; });
      return next;
    });

    // Generate images one-by-one (sequential — avoids hammering Pollinations)
    const runGeneration = async () => {
      // Track how many are left per platform
      const remaining: Record<string, number> = {};
      for (const p of postsNeedingImages) {
        remaining[p.platform] = (remaining[p.platform] ?? 0) + 1;
      }

      for (const post of postsNeedingImages) {
        try {
          const res  = await fetch("/api/generate-image", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ postId: post.id }),
          });
          const data = await res.json();
          if (data.imageUrl) {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === post.id ? { ...p, content_image_url: data.imageUrl } : p
              )
            );
          }
        } catch (err) {
          console.error("[dashboard] auto-generate image failed for post", post.id, err);
        }

        // Decrement remaining count for this platform
        remaining[post.platform]--;
        if (remaining[post.platform] === 0) {
          // All images for this platform are done
          setImgGenState((prev) => ({ ...prev, [post.platform]: "done" }));
        }
      }
    };

    runGeneration();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]); // Run once after initial load

  const handleToggleDisable = useCallback(async (platformId: string, newStatus: string) => {
    const res = await fetch("/api/product-platforms", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ platformId, status: newStatus }),
    });
    if (res.ok) {
      setPlatforms((prev) => {
        const updated = prev.map((p) => p.id === platformId ? { ...p, status: newStatus } : p);

        // Update product status based on platform states
        const allDisabled = updated.every((p) => p.status === "DISABLED");
        const anyConnected = updated.some((p) => p.status === "CONNECTED");
        const productStatus = allDisabled ? "inactive" : anyConnected ? "active" : "pending";

        fetch(`/api/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: productStatus }),
        }).catch(() => {});

        return updated;
      });
    }
  }, [productId]);

  // Group posts by platform
  const postsByPlatform = posts.reduce<Record<string, ScheduledPost[]>>((acc, p) => {
    if (!acc[p.platform]) acc[p.platform] = [];
    acc[p.platform].push(p);
    return acc;
  }, {});

  // Deduplicate platforms (keep latest per platform name)
  const seenPlatforms = new Set<string>();
  const uniquePlatforms = [...platforms].reverse().filter((p) => {
    if (seenPlatforms.has(p.platform)) return false;
    seenPlatforms.add(p.platform);
    return true;
  }).reverse();

  const connectedPlatforms = uniquePlatforms.filter((p) => p.status === "CONNECTED");

  const productColor  = product ? stringToColor(product.product_name) : "#6D28D9";
  const userInitial   = user?.name?.[0]?.toUpperCase() ?? "U";
  const userName      = user?.name?.split(" ")[0] ?? "";
  const totalPosts    = posts.length;
  const readyPosts    = posts.filter((p) => p.status === "READY").length;


  return (
    <div className="space-y-5 max-w-[1100px]">

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            {loading ? (
              <div className="h-6 w-44 bg-[#EAEAF4] rounded animate-pulse" />
            ) : (
              <>
                <h1 className="text-xl font-extrabold text-[#0F0E1A] tracking-tight">
                  {product?.product_name ?? "Dashboard"}
                </h1>
                {product?.website_url && (
                  <a href={product.website_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#9898B8] hover:text-[#6D28D9] transition-colors">
                    {product.website_url}
                  </a>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: productColor }}>
                {userInitial}
              </div>
              {userName && <span className="text-sm font-semibold text-[#0F0E1A]">{userName}</span>}
            </div>
            <button
              onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => (window.location.href = "/login"))}
              className="text-xs text-[#9898B8] hover:text-[#6D28D9] transition-all"
            >Sign out</button>
          </div>
        </div>

        {/* ── AI Weekly Update ─────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border border-[#EAEAF4] p-5 grid grid-cols-3 gap-4 shadow-[0_2px_8px_rgba(0,0,0,.04)]"
          style={{ background: "linear-gradient(145deg,rgba(109,40,217,.03),rgba(109,40,217,.06))" }}
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 bg-[#6D28D9] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity=".4"/>
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-extrabold text-[#0F0E1A]">AI Weekly Update ✨</div>
              <div className="text-xs font-semibold text-[#3D3D5C] mt-0.5">Your content strategy is live! 🎉</div>
              <div className="text-xs text-[#6C6C8A] mt-0.5">
                {connectedPlatforms.length > 0
                  ? `Managing ${connectedPlatforms.length} platform${connectedPlatforms.length > 1 ? "s" : ""} · ${readyPosts} posts ready to publish.`
                  : "Connect accounts to start publishing."}
              </div>
            </div>
          </div>
          <div className="border-x border-[#EAEAF4] px-4">
            <div className="text-xs font-bold text-[#0F0E1A] mb-2">This week&apos;s focus:</div>
            <div className="space-y-1.5">
              {["Optimal posting times", "Consistent brand voice", "Platform-native formats"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-[#3D3D5C]">
                  <span className="w-4 h-4 rounded-full bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#EDE9FE] rounded-xl px-3 py-2 text-center">
                <div className="text-2xl font-extrabold text-[#6D28D9]">{totalPosts}</div>
                <div className="text-[10px] text-[#6C6C8A] font-medium">Total Posts</div>
              </div>
              <div className="bg-[#D1FAE5] rounded-xl px-3 py-2 text-center">
                <div className="text-2xl font-extrabold text-[#059669]">{readyPosts}</div>
                <div className="text-[10px] text-[#6C6C8A] font-medium">Ready</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Platform blocks ───────────────────────────────────────────────── */}
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-extrabold text-[#0F0E1A]">Social Platforms</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#EAEAF4] p-5 h-52 animate-pulse" />
              ))}
            </div>
          ) : uniquePlatforms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#C8C8E0] p-8 text-center">
              <div className="text-sm font-bold text-[#0F0E1A] mb-1">No platforms yet</div>
              <div className="text-xs text-[#9898B8] mb-4">Connect your social accounts to see posts here.</div>
              <Link href="/onboarding?resume=1"
                className="inline-block px-5 py-2.5 bg-[#6D28D9] text-white text-xs font-bold rounded-xl hover:bg-[#5B21B6] transition-all">
                + Connect Accounts
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {uniquePlatforms.map((pl) => (
                <PlatformCard
                  key={pl.id}
                  platform={pl}
                  posts={postsByPlatform[pl.platform] ?? []}
                  username={pl.platform_username}
                  score={pl.priority_score}
                  imgLoading={imgGenState[pl.platform] === "loading"}
                  onClick={() => router.push(`/dashboard/${productId}/posts/${pl.platform}`)}
                  onToggleDisable={handleToggleDisable}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Upcoming content row ──────────────────────────────────────────── */}
        {posts.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#EAEAF4] p-5 shadow-[0_2px_8px_rgba(0,0,0,.04)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#6D28D9" strokeWidth="1.6"/>
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                <span className="text-sm font-extrabold text-[#0F0E1A]">Next Up</span>
                <span className="text-xs text-[#9898B8]">Upcoming scheduled posts across all platforms.</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {posts.slice(0, 8).map((post) => {
                const typeStyle = TYPE_COLORS[post.content_type] ?? { bg: "#F7F6FF", text: "#3D3D5C" };
                const plColor   = PLATFORM_COLORS[post.platform] ?? "#6D28D9";
                return (
                  <button
                    key={post.id}
                    onClick={() => router.push(`/dashboard/${productId}/posts/${post.platform}`)}
                    className="bg-white border border-[#EAEAF4] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.04)] hover:shadow-[0_4px_16px_rgba(109,40,217,.1)] transition-all text-left"
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-[#EAEAF4]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold text-white"
                          style={{ background: plColor }}>
                          {post.platform[0].toUpperCase()}
                        </div>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full"
                          style={{ background: typeStyle.bg, color: typeStyle.text }}>
                          {post.content_type}
                        </span>
                      </div>
                      <span className="text-[9px] font-semibold text-[#059669]">● Ready</span>
                    </div>
                    <div className="h-16 flex items-center justify-center p-2"
                      style={{ background: `linear-gradient(135deg,${plColor}18,${plColor}06)` }}>
                      <span className="text-[10px] text-[#3D3D5C] leading-tight line-clamp-3">
                        {post.content_text?.slice(0, 70)}…
                      </span>
                    </div>
                    <div className="px-3 py-2">
                      <div className="flex items-center gap-1 text-[10px] text-[#9898B8]">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                        {fmtDate(post.scheduled_at)} · {fmtTime(post.scheduled_at)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── AI status bar ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#EAEAF4] px-5 py-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,.04)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#6D28D9" opacity=".3"/>
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="text-sm font-extrabold text-[#0F0E1A]">AI is on it.</span>
              <span className="text-sm text-[#9898B8] ml-2">Creating, optimizing, and scheduling content to help you grow.</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#059669]" />
            <span className="text-xs font-semibold text-[#059669]">All systems running</span>
          </div>
        </div>

    </div>
  );
}
