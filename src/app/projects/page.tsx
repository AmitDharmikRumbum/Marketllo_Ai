"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useOnboarding } from "@/store/onboarding";
import { useProjectsStore } from "@/store/projects";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EazeProduct {
  id: string | number;
  product_name: string;
  website_url: string;
  appstore_url?: string | null;
  playstore_url?: string | null;
  product_desc?: string;
  logo_url?: string;
  status?: string;
  created_at?: string;
}

interface DisplayProject {
  id: string;
  name: string;
  url: string;
  desc: string;
  color: string;
  status: "active" | "inactive" | "pending";
  platforms: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C", linkedin: "#0A66C2", twitter: "#000", youtube: "#FF0000",
  tiktok: "#010101", facebook: "#1877F2", pinterest: "#E60023", x: "#000",
};

// Generate a consistent color from a string (product name)
function stringToColor(str: string): string {
  const colors = ["#6D28D9", "#0A66C2", "#E1306C", "#059669", "#D97706", "#DC2626"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function mapProduct(p: EazeProduct): DisplayProject {
  // Treat null/empty as "active" for products created before status field was added
  const status =
    p.status === "inactive" ? "inactive" :
    p.status === "pending"  ? "pending"  : "active";
  return {
    id: String(p.id),
    name: p.product_name || "Untitled",
    url: p.website_url || "",
    desc: p.product_desc || "",
    color: stringToColor(p.product_name || ""),
    status,
    platforms: [],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

function ProjectsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldRefresh = searchParams.get("refresh") === "1";

  const { projects, user, loaded, setProjects, setUser, setLoaded } = useProjectsStore();
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "pending">("all");
  const [loading, setLoading] = useState(!loaded);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const handleProductClick = async (productId: string) => {
    setLoadingProductId(productId);
    try {
      const res = await fetch(`/api/product-progress?productId=${productId}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        router.push("/dashboard");
        return;
      }

      const { nextStep, analysis, analysisId, selectedPlatforms } = data;

      if (nextStep >= 6) {
        // All steps complete → go to product dashboard
        router.push(`/dashboard/${productId}`);
        return;
      }

      // Load product state into Zustand store then resume onboarding
      const store = useOnboarding.getState();
      store.setProductId(productId);
      if (analysis) store.setAnalysis(analysis);
      if (analysisId) store.setAnalysisId(analysisId);
      if (selectedPlatforms?.length) {
        useOnboarding.setState({ selectedPlatforms });
      }
      store.setStep(nextStep);

      // Navigate to onboarding with resume flag so it doesn't reset
      router.push("/onboarding?resume=1");
    } catch {
      router.push("/dashboard");
    } finally {
      setLoadingProductId(null);
    }
  };

  useEffect(() => {
    // Skip fetch if already loaded and not forced refresh
    if (loaded && !shouldRefresh) return;

    setLoading(true);

    // Load current user
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});

    // Load products from EazeMyAPI (via our server proxy)
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.products) setProjects(d.products.map(mapProduct));
        setLoaded(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRefresh]);

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);
  const activeCount  = projects.filter((p) => p.status === "active").length;
  const pendingCount = projects.filter((p) => p.status === "pending").length;
  const inactiveCount = projects.filter((p) => p.status === "inactive").length;

  const userInitial = user?.name?.[0]?.toUpperCase() ?? "U";
  const userName = user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "You";

  return (
    <div className="min-h-screen bg-[#F7F6FF]">
      {/* Top bar */}
      <div className="bg-white border-b border-[#EAEAF4] h-14 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#6D28D9] rounded-lg flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 15 15" fill="white"><path d="M7.5 1L13 4v7l-5.5 3L2 11V4L7.5 1z" opacity=".3"/><path d="M7.5 1L13 4l-5.5 3L2 4l5.5-3z"/></svg>
          </div>
          <span className="font-extrabold text-sm text-[#0F0E1A]">Marketify AI</span>
          <span className="text-[#EAEAF4] mx-2">/</span>
          <span className="text-sm font-medium text-[#6C6C8A]">My Products</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative w-8 h-8 rounded-lg bg-[#F7F6FF] flex items-center justify-center hover:bg-[#EDE9FE] transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#6C6C8A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#6D28D9] flex items-center justify-center text-white text-xs font-bold">{userInitial}</div>
          <span className="text-sm font-semibold text-[#0F0E1A]">{userName}</span>
          <button
            onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => (window.location.href = "/login"))}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#6C6C8A] bg-[#F7F6FF] border border-[#EAEAF4] rounded-lg hover:text-[#6D28D9] hover:border-[#6D28D9] transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F0E1A] tracking-tight">My Products</h1>
            <p className="text-sm text-[#6C6C8A] mt-0.5">Manage and monitor all your AI marketing campaigns.</p>
          </div>
          <Link href="/onboarding" className="flex items-center gap-2 px-5 py-2.5 bg-[#6D28D9] text-white text-sm font-semibold rounded-xl hover:bg-[#5B21B6] hover:shadow-[0_6px_20px_rgba(109,40,217,.35)] transition-all">
            + Add New Product
          </Link>
        </div>

        {/* Stats chips */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: "Active Products", value: String(activeCount), icon: "✓" },
            { label: "Total Products", value: String(projects.length), icon: "📦" },
          ].map((chip) => (
            <div key={chip.label} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#EAEAF4] rounded-full text-xs font-semibold text-[#3D3D5C] shadow-[0_1px_4px_rgba(0,0,0,.04)]">
              <span>{chip.icon}</span>
              <span className="font-bold text-[#6D28D9]">{chip.value}</span>
              <span className="text-[#9898B8]">{chip.label}</span>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5">
          {[
            { key: "all",      label: `All (${projects.length})` },
            { key: "active",   label: `Active (${activeCount})` },
            { key: "pending",  label: `Pending (${pendingCount})` },
            { key: "inactive", label: `Inactive (${inactiveCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as "all" | "active" | "inactive" | "pending")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                filter === tab.key
                  ? "bg-[#6D28D9] text-white"
                  : "bg-white border border-[#EAEAF4] text-[#6C6C8A] hover:text-[#3D3D5C]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#EAEAF4] p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#F7F6FF] rounded-xl" />
                  <div className="flex-1">
                    <div className="h-3 bg-[#F7F6FF] rounded w-24 mb-2" />
                    <div className="h-2 bg-[#F7F6FF] rounded w-32" />
                  </div>
                </div>
                <div className="h-2 bg-[#F7F6FF] rounded w-full mb-2" />
                <div className="h-8 bg-[#F7F6FF] rounded-xl mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#EDE9FE] rounded-2xl flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <h2 className="text-lg font-bold text-[#0F0E1A] mb-2">No products yet</h2>
            <p className="text-sm text-[#6C6C8A] mb-6">Add your first product and let AI handle your marketing.</p>
            <Link href="/onboarding" className="px-6 py-3 bg-[#6D28D9] text-white text-sm font-semibold rounded-xl hover:bg-[#5B21B6] transition-all">
              Add Your First Product →
            </Link>
          </div>
        )}

        {/* Grid */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-[#EAEAF4] p-5 shadow-[0_2px_8px_rgba(0,0,0,.04)] hover:shadow-[0_10px_28px_rgba(109,40,217,.1)] transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-base" style={{ background: p.color }}>
                      {p.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0F0E1A]">{p.name}</div>
                      <div className="text-xs text-[#9898B8]">{p.url}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    p.status === "active"   ? "bg-[#D1FAE5] text-[#059669]" :
                    p.status === "inactive" ? "bg-[#FEE2E2] text-[#DC2626]" :
                                             "bg-[#FEF3C7] text-[#D97706]"
                  }`}>
                    {p.status === "active" ? "Active" : p.status === "inactive" ? "Inactive" : "Pending Setup"}
                  </span>
                </div>

                {/* Description */}
                {p.desc && (
                  <p className="text-xs text-[#6C6C8A] mb-3 leading-relaxed line-clamp-2">{p.desc}</p>
                )}

                {/* Platforms */}
                {p.platforms.length > 0 ? (
                  <div className="flex gap-1.5 mb-4">
                    {p.platforms.map((pl) => (
                      <div
                        key={pl}
                        title={pl}
                        className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ background: PLATFORM_COLORS[pl] || "#6D28D9" }}
                      >
                        {pl[0].toUpperCase()}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4 text-xs text-[#9898B8]">No platforms connected yet</div>
                )}

                {/* CTA */}
                <button
                  onClick={() => handleProductClick(p.id)}
                  disabled={loadingProductId === p.id}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#EDE9FE] text-[#6D28D9] text-xs font-bold rounded-xl hover:bg-[#6D28D9] hover:text-white transition-all disabled:opacity-60 disabled:cursor-wait"
                >
                  {loadingProductId === p.id ? (
                    <>
                      <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10"/></svg>
                      Loading...
                    </>
                  ) : (
                    "Open Project →"
                  )}
                </button>
              </div>
            ))}

            {/* Add New card */}
            <Link href="/onboarding" className="flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-[#C8C8E0] p-8 hover:border-[#6D28D9] hover:bg-[#EDE9FE]/20 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center mb-3 group-hover:bg-[#6D28D9] transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" className="group-hover:stroke-white transition-all"/></svg>
              </div>
              <div className="text-sm font-bold text-[#3D3D5C] group-hover:text-[#6D28D9] transition-all">Add New Product</div>
              <div className="text-xs text-[#9898B8] mt-1">Connect another startup or brand</div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F6FF] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#6D28D9] border-t-transparent rounded-full animate-spin" /></div>}>
      <ProjectsPageInner />
    </Suspense>
  );
}
