"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/> },
  { label: "Content", href: "/dashboard/content", icon: <><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M10 8l6 4-6 4V8z" fill="currentColor"/></> },
  { label: "Content Calendar", href: "/dashboard/calendar", icon: <><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/></> },
  { label: "Media Library", href: "/dashboard/media", icon: <><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" fill="none"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/></> },
  { label: "AI Insights", href: "/dashboard/insights", icon: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/> },
  { label: "Reports", href: "/dashboard/reports", icon: <path d="M3 3v18h18M8 17V9m4 8V5m4 12V12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/> },
  { label: "Accounts", href: "/dashboard/accounts", icon: <><circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M3 21v-2a5 5 0 0110 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/><circle cx="17" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M20 21v-1a3 3 0 00-5 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></> },
  { label: "Settings", href: "/dashboard/settings", icon: <><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.6" fill="none"/></> },
];

interface AppSidebarProps {
  projectName?: string;
  projectColor?: string;
}

export function AppSidebar({ projectName = "Taskllo", projectColor = "#6D28D9" }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] flex-shrink-0 bg-white border-r border-[#EAEAF4] flex flex-col h-screen overflow-hidden">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-[#EAEAF4]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-[#6D28D9] rounded-lg flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 15 15" fill="white"><path d="M7.5 1L13 4v7l-5.5 3L2 11V4L7.5 1z" opacity=".3"/><path d="M7.5 1L13 4l-5.5 3L2 4l5.5-3z"/></svg>
          </div>
          <span className="font-extrabold text-sm text-[#0F0E1A]">Marketify AI</span>
        </div>

        {/* Project switcher */}
        <Link href="/projects" className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#F7F6FF] hover:bg-[#EDE9FE] transition-all group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: projectColor }}>
            {projectName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#0F0E1A] truncate">{projectName}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#9898B8] group-hover:text-[#6D28D9] transition-colors"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? "bg-[#EDE9FE] text-[#6D28D9]"
                  : "text-[#6C6C8A] hover:bg-[#F7F6FF] hover:text-[#3D3D5C]"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" className={active ? "text-[#6D28D9]" : ""}>
                {item.icon}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Robot card */}
      <div className="px-3 pb-3">
        <div className="bg-[#F7F6FF] rounded-2xl p-3 text-center border border-[#EAEAF4]">
          <div className="w-10 h-10 bg-[#6D28D9] rounded-xl mx-auto mb-2 flex items-center justify-center animate-bob">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="10" r="2" fill="white"/><circle cx="15" cy="10" r="2" fill="white"/><path d="M8 15s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div className="text-xs font-bold text-[#0F0E1A] mb-0.5">Your AI Marketing Manager</div>
          <div className="text-[10px] text-[#9898B8] leading-snug mb-2">Working 24/7 to grow your brand while you focus on building it.</div>
        </div>

        {/* Ask AI button */}
        <Link href="/dashboard/ask-ai" className="mt-2 flex items-center justify-between w-full px-4 py-2.5 bg-[#6D28D9] text-white text-xs font-bold rounded-xl hover:bg-[#5B21B6] transition-all">
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity=".4"/><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Ask AI
          </div>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 8h8M9 5l3 3-3 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </div>
    </aside>
  );
}
