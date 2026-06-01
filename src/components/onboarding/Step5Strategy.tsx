"use client";

import { useOnboarding } from "@/store/onboarding";
import { useRouter } from "next/navigation";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_PREVIEW = [
  { day: "Mon", type: "Post", icon: "📝", time: "11:00 AM" },
  { day: "Tue", type: "Reel", icon: "🎬", time: "7:00 PM" },
  { day: "Wed", type: "Carousel", icon: "🎠", time: "11:00 AM" },
  { day: "Thu", type: "Post", icon: "📝", time: "9:00 AM" },
  { day: "Fri", type: "Reel", icon: "🎬", time: "7:00 PM" },
  { day: "Sat", type: "Carousel", icon: "🎠", time: "11:00 AM" },
  { day: "Sun", type: "Rest", icon: "💬", time: "Flexible" },
];

const BEST_TIMES = [
  { platform: "Instagram", times: "11:00 AM, 7:00 PM", color: "#E1306C" },
  { platform: "LinkedIn", times: "9:00 AM, 1:00 PM", color: "#0A66C2" },
  { platform: "X (Twitter)", times: "10:00 AM, 5:00 PM", color: "#000000" },
];

export function Step5Strategy() {
  const router = useRouter();
  const { strategy, setStrategy, setStep } = useOnboarding();
  const { postsPerWeek, contentMix } = strategy;
  const total = contentMix.posts + contentMix.reels + contentMix.carousels;

  const pct = (n: number) => Math.round((n / Math.max(total, 1)) * 100);

  const adjust = (key: keyof typeof contentMix, delta: number) => {
    const next = Math.max(0, contentMix[key] + delta);
    setStrategy({ contentMix: { ...contentMix, [key]: next } });
  };

  const handleSave = () => {
    router.push("/projects");
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F0E1A] tracking-tight mb-1">AI Strategy Setup ✨</h1>
          <p className="text-sm text-[#6C6C8A]">Review your AI-generated strategy and customize it to fit your goals.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#6D28D9] border border-[#C8C8E0] rounded-xl hover:border-[#6D28D9] transition-all">
          How AI creates strategy
        </button>
      </div>

      {/* AI recommendation banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#EDE9FE] to-[#F5F0FF] rounded-xl p-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#6D28D9] rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity=".4"/><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div className="text-xs font-bold text-[#0F0E1A]">Here&apos;s what AI recommends for you</div>
            <div className="text-xs text-[#6C6C8A]">Based on your industry, audience, and goals, we suggest the following weekly strategy.</div>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-[#6D28D9] text-white text-xs font-semibold rounded-lg hover:bg-[#5B21B6] transition-all">
          🔄 Regenerate Strategy
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Posting frequency */}
        <div className="bg-white border border-[#EAEAF4] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,.04)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#6D28D9" strokeWidth="1.6"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </div>
            <span className="text-xs font-bold text-[#0F0E1A]">Posting Frequency</span>
          </div>
          <p className="text-[11px] text-[#9898B8] mb-3">How often do you want to post?</p>
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setStrategy({ postsPerWeek: Math.max(1, postsPerWeek - 1) })} className="w-7 h-7 rounded-lg bg-[#F7F6FF] border border-[#EAEAF4] text-[#6D28D9] font-bold hover:bg-[#EDE9FE] transition-all flex items-center justify-center">−</button>
            <div className="text-center">
              <span className="text-2xl font-extrabold text-[#0F0E1A]">{postsPerWeek}</span>
              <span className="text-sm text-[#6C6C8A] font-medium ml-1">posts per week</span>
            </div>
            <button onClick={() => setStrategy({ postsPerWeek: postsPerWeek + 1 })} className="w-7 h-7 rounded-lg bg-[#F7F6FF] border border-[#EAEAF4] text-[#6D28D9] font-bold hover:bg-[#EDE9FE] transition-all flex items-center justify-center">+</button>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#059669]">
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Recommended: 4–7 posts per week
          </div>
        </div>

        {/* Content Mix */}
        <div className="bg-white border border-[#EAEAF4] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,.04)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#6D28D9" strokeWidth="1.6"/><path d="M12 3v9l6 3" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </div>
            <span className="text-xs font-bold text-[#0F0E1A]">Content Mix</span>
          </div>
          <p className="text-[11px] text-[#9898B8] mb-3">Customize the types of content you want to publish.</p>
          <div className="space-y-2.5">
            {[
              { key: "posts" as const, label: "Posts", color: "#6D28D9" },
              { key: "reels" as const, label: "Reels", color: "#DC2626" },
              { key: "carousels" as const, label: "Carousels", color: "#059669" },
            ].map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-[#3D3D5C] w-16">{label}</span>
                <button onClick={() => adjust(key, -1)} className="w-5 h-5 text-xs font-bold bg-[#F7F6FF] rounded hover:bg-[#EDE9FE] transition-all">−</button>
                <span className="text-sm font-bold text-[#0F0E1A] w-4 text-center">{contentMix[key]}</span>
                <button onClick={() => adjust(key, 1)} className="w-5 h-5 text-xs font-bold bg-[#F7F6FF] rounded hover:bg-[#EDE9FE] transition-all">+</button>
                <span className="text-[10px] font-semibold w-7 text-right" style={{ color }}>{pct(contentMix[key])}%</span>
                <div className="flex-1 h-1 bg-[#F7F6FF] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct(contentMix[key])}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-center text-[11px] font-semibold text-[#3D3D5C] bg-[#F7F6FF] rounded-lg py-1.5">
            Total: {total} posts per week
          </div>
        </div>

        {/* Best Times */}
        <div className="bg-white border border-[#EAEAF4] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,.04)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#6D28D9" strokeWidth="1.6"/><path d="M12 7v5l3 3" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </div>
            <span className="text-xs font-bold text-[#0F0E1A]">Best Times to Post</span>
          </div>
          <p className="text-[11px] text-[#9898B8] mb-3">AI-recommended times based on audience activity</p>
          <div className="space-y-2.5">
            {BEST_TIMES.map((t) => (
              <div key={t.platform} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white" style={{ background: t.color }}>{t.platform[0]}</div>
                  <span className="text-xs text-[#3D3D5C]">{t.platform}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#0F0E1A]">{t.times}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly preview */}
      <div className="bg-white border border-[#EAEAF4] rounded-2xl p-4 mb-4 shadow-[0_2px_8px_rgba(0,0,0,.04)]">
        <div className="flex items-center gap-2 mb-3">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#6D28D9" strokeWidth="1.6"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round"/></svg>
          <span className="text-sm font-bold text-[#0F0E1A]">Weekly Preview</span>
          <span className="text-xs text-[#9898B8]">See how your week will look like.</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {WEEK_PREVIEW.map((w) => (
            <div key={w.day} className="text-center">
              <div className="text-xs font-semibold text-[#9898B8] mb-2">{w.day}</div>
              <div className="bg-[#F7F6FF] rounded-xl p-2 flex flex-col items-center gap-1">
                <span className="text-base">{w.icon}</span>
                <span className="text-[10px] font-bold text-[#3D3D5C]">{w.type}</span>
                <span className="text-[9px] text-[#9898B8]">{w.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI optimize banner */}
      <div className="bg-[#F7F6FF] border border-[#EAEAF4] rounded-xl p-3 flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="#6D28D9" opacity=".3"/><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div>
            <div className="text-xs font-bold text-[#0F0E1A]">AI will optimize as we go</div>
            <div className="text-[11px] text-[#6C6C8A]">Our AI will analyze performance and continuously improve your strategy.</div>
          </div>
        </div>
        {["Analyze Performance", "Learn What Works", "Optimize Next Week"].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            {i > 0 && <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 8h8M8 4l4 4-4 4" stroke="#9898B8" strokeWidth="1.2" strokeLinecap="round"/></svg>}
            <span className={`text-xs font-semibold ${i === 0 ? "text-[#6D28D9]" : i === 1 ? "text-[#059669]" : "text-[#D97706]"}`}>{step.split(" ")[0]}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setStep(4)} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-[#6C6C8A] border border-[#C8C8E0] rounded-xl hover:text-[#0F0E1A] transition-all">
          ← Back
        </button>
        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-[#6D28D9] text-white text-sm font-semibold rounded-xl hover:bg-[#5B21B6] hover:shadow-[0_6px_20px_rgba(109,40,217,.35)] transition-all">
          Save & Start Generating Content →
        </button>
      </div>
    </div>
  );
}
