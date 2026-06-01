"use client";

import { useState } from "react";
import Link from "next/link";

const PROJECTS = [
  {
    id: "1", name: "Taskllo", url: "taskllo.com", color: "#6D28D9", status: "active",
    platforms: ["instagram", "linkedin", "twitter"],
    followers: "2.4K", followersUp: 18,
    postsPerWeek: 6, engageRate: "4.2%", engageUp: 12,
  },
  {
    id: "2", name: "DesignFlow", url: "designflow.io", color: "#0891B2", status: "active",
    platforms: ["instagram", "linkedin", "pinterest", "facebook"],
    followers: "1.8K", followersUp: 24,
    postsPerWeek: 8, engageRate: "5.8%", engageUp: 31,
  },
  {
    id: "3", name: "GrowthLab", url: "growthlab.co", color: "#059669", status: "active",
    platforms: ["linkedin", "twitter", "youtube"],
    followers: "956", followersUp: 38,
    postsPerWeek: 4, engageRate: "6.1%", engageUp: 42,
  },
  {
    id: "4", name: "ShopMate", url: "shopmate.app", color: "#D97706", status: "paused",
    platforms: ["instagram", "facebook", "tiktok"],
    followers: "3.1K", followersUp: 0,
    postsPerWeek: 0, engageRate: "2.1%", engageUp: -8,
  },
];

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C", linkedin: "#0A66C2", twitter: "#000", youtube: "#FF0000",
  tiktok: "#010101", facebook: "#1877F2", pinterest: "#E60023",
};

export default function ProjectsPage() {
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");

  const filtered = filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.status === filter);
  const activeCount = PROJECTS.filter((p) => p.status === "active").length;

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
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#DC2626] rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#6D28D9] flex items-center justify-center text-white text-xs font-bold">A</div>
          <span className="text-sm font-semibold text-[#0F0E1A]">Alex</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#6C6C8A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
            { label: "Active Products", value: `${activeCount}`, icon: "✓" },
            { label: "Hours Saved", value: "12h", icon: "⏱" },
            { label: "Avg Engagement", value: "+287%", icon: "📈" },
            { label: "Posts Published", value: "47", icon: "📝" },
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
            { key: "all", label: "All" },
            { key: "active", label: `Active (${activeCount})` },
            { key: "paused", label: "Paused (1)" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as "all" | "active" | "paused")}
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

        {/* Grid */}
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
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${p.status === "active" ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEF3C7] text-[#D97706]"}`}>
                  {p.status === "active" ? "Active" : "Paused"}
                </span>
              </div>

              {/* Platforms */}
              <div className="flex gap-1.5 mb-4">
                {p.platforms.map((pl) => (
                  <div key={pl} className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold text-white" style={{ background: PLATFORM_COLORS[pl] }}>
                    {pl[0].toUpperCase()}
                  </div>
                ))}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-[#F7F6FF] rounded-xl p-2.5 text-center">
                  <div className="text-sm font-extrabold text-[#0F0E1A]">{p.followers}</div>
                  <div className="text-[10px] text-[#9898B8]">Followers</div>
                  {p.followersUp !== 0 && (
                    <div className={`text-[10px] font-semibold ${p.followersUp > 0 ? "text-[#059669]" : "text-[#DC2626]"}`}>
                      {p.followersUp > 0 ? "↑" : "↓"}{Math.abs(p.followersUp)}%
                    </div>
                  )}
                </div>
                <div className="bg-[#F7F6FF] rounded-xl p-2.5 text-center">
                  <div className="text-sm font-extrabold text-[#0F0E1A]">{p.postsPerWeek}</div>
                  <div className="text-[10px] text-[#9898B8]">Posts/wk</div>
                  <div className="text-[10px] text-[#9898B8]">{p.status === "paused" ? "paused" : "active"}</div>
                </div>
                <div className="bg-[#F7F6FF] rounded-xl p-2.5 text-center">
                  <div className="text-sm font-extrabold text-[#0F0E1A]">{p.engageRate}</div>
                  <div className="text-[10px] text-[#9898B8]">Engage</div>
                  {p.engageUp !== 0 && (
                    <div className={`text-[10px] font-semibold ${p.engageUp > 0 ? "text-[#059669]" : "text-[#DC2626]"}`}>
                      {p.engageUp > 0 ? "↑" : "↓"}{Math.abs(p.engageUp)}%
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#EDE9FE] text-[#6D28D9] text-xs font-bold rounded-xl hover:bg-[#6D28D9] hover:text-white transition-all"
              >
                View Dashboard →
              </Link>
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
      </div>
    </div>
  );
}
