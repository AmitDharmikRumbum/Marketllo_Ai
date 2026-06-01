import Link from "next/link";

const UPCOMING = [
  {
    platform: "instagram", type: "Reel", title: "3 Productivity Hacks",
    date: "Today", time: "8:00 PM",
    thumb: { bg: "linear-gradient(160deg,#2D1B69,#1E1040)", text: "3 PRODUCTIVITY HACKS", textColor: "white" },
  },
  {
    platform: "linkedin", type: "Post", title: "Why Clear Processes Win",
    date: "Tomorrow", time: "9:00 AM",
    thumb: { bg: "linear-gradient(145deg,#DBEAFE,#EDE9FE)", text: "Why Clear Processes Win", textColor: "#0F0E1A" },
  },
  {
    platform: "instagram", type: "Carousel", title: "Top 5 Tools for Startups",
    date: "Thu, May 29", time: "11:00 AM",
    thumb: { bg: "linear-gradient(160deg,#FEE2E2,#FCE7F3)", text: "TOP 5 TOOLS FOR STARTUPS", textColor: "#DC2626" },
    slides: "1/5",
  },
  {
    platform: "twitter", type: "Post", title: "One small improvement today.",
    date: "Fri, May 30", time: "10:00 AM",
    thumb: { bg: "#F7F6FF", text: "One small improvement today. Big results tomorrow.", textColor: "#0F0E1A" },
  },
];

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C", linkedin: "#0A66C2", twitter: "#000", youtube: "#FF0000",
};

const TYPE_COLORS: Record<string, string> = {
  Reel: "#EDE9FE", Post: "#DBEAFE", Carousel: "#FEE2E2",
};
const TYPE_TEXT_COLORS: Record<string, string> = {
  Reel: "#6D28D9", Post: "#0A66C2", Carousel: "#DC2626",
};

export default function DashboardPage() {
  return (
    <div className="space-y-4 max-w-[1100px]">
      {/* AI Weekly Update */}
      <div
        className="bg-white rounded-2xl border border-[#EAEAF4] p-5 grid grid-cols-3 gap-4 shadow-[0_2px_8px_rgba(0,0,0,.04)]"
        style={{ background: "linear-gradient(145deg, rgba(109,40,217,.03), rgba(109,40,217,.06))" }}
      >
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 bg-[#6D28D9] rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity=".4"/><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div className="text-sm font-extrabold text-[#0F0E1A]">AI Weekly Update ✨</div>
            <div className="text-xs font-semibold text-[#3D3D5C] mt-0.5">Great progress last week! 🎉</div>
            <div className="text-xs text-[#6C6C8A] mt-0.5">Your reels performed 42% better than other content.</div>
          </div>
        </div>
        <div className="border-x border-[#EAEAF4] px-4">
          <div className="text-xs font-bold text-[#0F0E1A] mb-2">This week I&apos;ll focus on:</div>
          <div className="space-y-1.5">
            {["More short-form reels", "Evening posting (7PM – 10PM)", "Productivity tutorials"].map((item) => (
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
          <div className="text-xs font-semibold text-[#9898B8] mb-1">Expected Growth</div>
          <div className="flex items-end gap-2">
            <span className="text-[36px] font-extrabold text-[#6D28D9] leading-none">+18%</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mb-1"><path d="M3 17l6-6 4 4 8-9" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="text-xs text-[#9898B8] mt-1">vs last week</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Reach", value: "18.6K", pct: "18%", icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/>, color: "#6D28D9", sparkColor: "#6D28D9" },
          { label: "Engagement", value: "3.7K", pct: "24%", icon: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="1.6" fill="none"/>, color: "#DC2626", sparkColor: "#DC2626" },
          { label: "Followers", value: "842", pct: "21%", icon: <><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/></>, color: "#6D28D9", sparkColor: "#6D28D9" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#EAEAF4] p-5 shadow-[0_2px_8px_rgba(0,0,0,.04)] flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: stat.color + "18" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ color: stat.color }}>{stat.icon}</svg>
            </div>
            <div className="flex-1">
              <div className="text-xs text-[#9898B8] font-semibold mb-0.5">{stat.label}</div>
              <div className="text-2xl font-extrabold text-[#0F0E1A] leading-none mb-1">{stat.value}</div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-[#D1FAE5] text-[#059669] text-[10px] font-bold rounded-full">↑ {stat.pct}</span>
                <span className="text-[10px] text-[#9898B8]">vs last 7 days</span>
              </div>
            </div>
            {/* Sparkline */}
            <svg width="80" height="32" viewBox="0 0 80 32" fill="none">
              <polyline points="0,28 14,20 28,22 42,14 56,16 70,8 80,10" stroke={stat.sparkColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".7"/>
            </svg>
          </div>
        ))}
      </div>

      {/* Upcoming Content */}
      <div className="bg-white rounded-2xl border border-[#EAEAF4] p-5 shadow-[0_2px_8px_rgba(0,0,0,.04)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#6D28D9" strokeWidth="1.6"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round"/></svg>
            <span className="text-sm font-extrabold text-[#0F0E1A]">Upcoming Content</span>
            <span className="text-xs text-[#9898B8]">Here&apos;s what&apos;s scheduled next.</span>
          </div>
          <Link href="/dashboard/calendar" className="flex items-center gap-1.5 text-xs font-semibold text-[#6D28D9] hover:underline">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#6D28D9" strokeWidth="1.6"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round"/></svg>
            View Calendar →
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {UPCOMING.map((item, i) => (
            <div key={i} className="bg-white border border-[#EAEAF4] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.04)] hover:shadow-[0_4px_16px_rgba(109,40,217,.08)] transition-all">
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#EAEAF4]">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold text-white" style={{ background: PLATFORM_COLORS[item.platform] }}>
                    {item.platform[0].toUpperCase()}
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full" style={{ background: TYPE_COLORS[item.type] || "#F7F6FF", color: TYPE_TEXT_COLORS[item.type] || "#3D3D5C" }}>
                    {item.type}
                  </span>
                </div>
                <button className="text-[#9898B8] hover:text-[#6C6C8A]">···</button>
              </div>

              {/* Thumbnail */}
              <div className="h-20 flex items-center justify-center p-3 text-center relative" style={{ background: item.thumb.bg }}>
                <span className="text-[10px] font-bold leading-tight" style={{ color: item.thumb.textColor }}>{item.thumb.text}</span>
                {item.slides && (
                  <span className="absolute top-1 right-1 px-1 py-0.5 bg-white/80 text-[8px] font-bold rounded text-[#3D3D5C]">{item.slides}</span>
                )}
                {item.type === "Reel" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="white"><path d="M2 1l7 4-7 4V1z"/></svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="px-3 py-2">
                <div className="text-[10px] font-bold text-[#0F0E1A] mb-1.5 truncate">{item.title}</div>
                <div className="flex items-center gap-1 text-[10px] text-[#9898B8] mb-0.5">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  {item.date}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#9898B8] mb-2">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  {item.time}
                </div>
                <div className="flex items-center gap-1 text-[9px] font-semibold text-[#059669]">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  Scheduled
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Status bar */}
      <div className="bg-white rounded-2xl border border-[#EAEAF4] px-5 py-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,.04)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="#6D28D9" opacity=".3"/><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <span className="text-sm font-extrabold text-[#0F0E1A]">AI is on it.</span>
            <span className="text-sm text-[#9898B8] ml-2">Creating, optimizing, and scheduling content to help you grow.</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#059669] animate-pulsedot" />
          <span className="text-xs font-semibold text-[#059669]">All systems running smoothly</span>
        </div>
      </div>
    </div>
  );
}
