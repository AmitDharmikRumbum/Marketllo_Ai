"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

function DashboardMockup() {
  return (
    <div className="relative">
      {/* Floating metric cards */}
      <div className="animate-float absolute -top-4 -left-6 z-10 bg-white rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(109,40,217,.12)] border border-[#EAEAF4]">
        <div className="text-xs font-semibold text-[#6C6C8A] mb-0.5">Engagement</div>
        <div className="text-xl font-extrabold text-[#6D28D9]">+247%</div>
        <div className="flex items-center gap-1 text-xs text-[#059669] font-semibold mt-0.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 9l4-4 4 4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          vs last month
        </div>
      </div>
      <div className="animate-float-slow absolute -bottom-4 -right-4 z-10 bg-white rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(109,40,217,.12)] border border-[#EAEAF4]">
        <div className="text-xs font-semibold text-[#6C6C8A] mb-0.5">Time Saved</div>
        <div className="text-xl font-extrabold text-[#0F0E1A]">12h</div>
        <div className="text-xs text-[#6C6C8A] font-medium">per week</div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-[#EAEAF4] shadow-[0_8px_40px_rgba(80,40,160,.1)] overflow-hidden">
        {/* Sidebar + content */}
        <div className="flex">
          {/* Mini sidebar */}
          <div className="w-14 bg-[#F7F6FF] border-r border-[#EAEAF4] p-2 flex flex-col gap-2 items-center pt-4">
            <div className="w-7 h-7 bg-[#6D28D9] rounded-lg flex items-center justify-center mb-2">
              <svg width="12" height="12" viewBox="0 0 15 15" fill="white"><path d="M7.5 1L13 4v7l-5.5 3L2 11V4L7.5 1z" opacity=".3"/><path d="M7.5 1L13 4l-5.5 3L2 4l5.5-3z"/></svg>
            </div>
            {[
              <path key="home" d="M3 12V7l4-4 4 4v5H8v-3H6v3z" fill="currentColor"/>,
              <path key="cal" d="M4 5h8M4 8h8M4 11h5M3 3h10v10H3z" stroke="currentColor" strokeWidth="1.2" fill="none"/>,
              <path key="chart" d="M3 12V8l3-3 3 3 3-5v8" stroke="currentColor" strokeWidth="1.2" fill="none"/>,
            ].map((icon, i) => (
              <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? "bg-[#EDE9FE] text-[#6D28D9]" : "text-[#9898B8]"}`}>
                <svg width="14" height="14" viewBox="0 0 16 16">{icon}</svg>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            {/* AI update banner */}
            <div className="bg-gradient-to-r from-[#EDE9FE] to-[#F5F0FF] rounded-xl p-3 mb-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#6D28D9] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#0F0E1A]">AI Weekly Update ✨</div>
                <div className="text-xs text-[#6C6C8A] truncate">Reels outperformed posts by 42%</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-[#6C6C8A]">Expected</div>
                <div className="text-sm font-extrabold text-[#6D28D9]">+18%</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: "Reach", value: "18.6K", pct: "+18%", color: "#6D28D9" },
                { label: "Engage", value: "3.7K", pct: "+24%", color: "#DC2626" },
                { label: "Followers", value: "842", pct: "+21%", color: "#6D28D9" },
              ].map((m) => (
                <div key={m.label} className="bg-[#F7F6FF] rounded-xl p-2.5">
                  <div className="text-[10px] text-[#6C6C8A] font-semibold mb-1">{m.label}</div>
                  <div className="text-sm font-extrabold text-[#0F0E1A]">{m.value}</div>
                  <div className="text-[10px] font-semibold mt-0.5" style={{ color: "#059669" }}>{m.pct}</div>
                </div>
              ))}
            </div>

            {/* Content cards row */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: "Reel", platform: "IG", title: "3 Productivity Hacks", bg: "linear-gradient(160deg,#2D1B69,#1E1040)", time: "Today 8PM" },
                { type: "Post", platform: "in", title: "Why Clear Processes Win", bg: "linear-gradient(145deg,#DBEAFE,#EDE9FE)", time: "Tomorrow 9AM" },
              ].map((c) => (
                <div key={c.title} className="bg-white rounded-xl border border-[#EAEAF4] overflow-hidden">
                  <div className="h-16 flex items-center justify-center text-center p-2" style={{ background: c.bg }}>
                    <span className="text-[10px] font-bold leading-tight" style={{ color: c.bg.includes("2D1B69") ? "white" : "#0F0E1A" }}>{c.title}</span>
                  </div>
                  <div className="p-2">
                    <div className="text-[9px] font-bold text-[#059669] flex items-center gap-1">
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="#059669" strokeWidth="1.2"/><path d="M3 5l1.5 1.5L7 3.5" stroke="#059669" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      Scheduled
                    </div>
                    <div className="text-[9px] text-[#9898B8] mt-0.5">{c.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI status bar */}
        <div className="border-t border-[#EAEAF4] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="#6D28D9" opacity=".3"/><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="text-[10px] font-bold text-[#0F0E1A]">AI is on it.</span>
            <span className="text-[10px] text-[#9898B8]">Creating content for you</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulsedot" />
            <span className="text-[9px] font-semibold text-[#059669]">All systems running</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const checklistRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in");
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fu").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const checklist = [
    "Analyzes your product & audience automatically",
    "Generates posts, reels, carousels & memes daily",
    "Publishes to Instagram, LinkedIn, X and more",
    "Learns what works and improves every week",
  ];

  return (
    <section className="min-h-screen flex items-center pt-24 pb-20 px-5 md:px-20 bg-white border-b border-[#EAEAF4] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-60px] right-[-80px] w-[520px] h-[520px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(109,40,217,.07) 0%, transparent 70%)" }} />

      <div className="relative max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <div className="fu inline-flex items-center gap-2 px-3 py-1.5 bg-[#EDE9FE] rounded-full text-xs font-semibold text-[#6D28D9] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6D28D9] animate-pulsedot" />
            AI-Powered Marketing Manager
          </div>

          <h1 className="fu text-[clamp(36px,4vw,54px)] font-extrabold leading-[1.12] tracking-[-0.025em] text-[#0F0E1A] mb-5">
            Your startup&apos;s<br />
            <span className="text-[#6D28D9]">AI Marketing Team</span><br />
            on autopilot
          </h1>

          <p className="fu text-base text-[#6C6C8A] leading-[1.7] mb-7 max-w-[460px]">
            Marketify AI analyzes your product, creates platform-perfect content, and publishes it automatically — while you focus on building.
          </p>

          <ul ref={checklistRef} className="fu space-y-3 mb-8">
            {checklist.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm font-medium text-[#3D3D5C]">
                <span className="w-5 h-5 rounded-full bg-[#D1FAE5] flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="fu flex flex-wrap gap-3 mb-8">
            <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#6D28D9] text-white text-sm font-semibold rounded-xl hover:bg-[#5B21B6] hover:shadow-[0_6px_20px_rgba(109,40,217,.35)] hover:-translate-y-px transition-all">
              Get Started Free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-[#0F0E1A] text-sm font-semibold rounded-xl border border-[#C8C8E0] hover:border-[#6D28D9] hover:text-[#6D28D9] transition-all">
              See How It Works
            </a>
          </div>

          <div className="fu flex items-center gap-3">
            <div className="flex -space-x-2">
              {["#6D28D9","#059669","#D97706","#DC2626"].map((c) => (
                <div key={c} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold" style={{ background: c }}>
                  {c[1]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-[#D97706]">{"★★★★★".split("").map((s, i) => <span key={i} className="text-xs">{s}</span>)}</div>
              <div className="text-xs text-[#6C6C8A] font-medium">1,200+ founders growing with AI</div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="fu lg:block">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
