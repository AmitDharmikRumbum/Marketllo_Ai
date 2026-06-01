"use client";

import { useOnboarding } from "@/store/onboarding";

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    badge: "Highly Recommended",
    badgeColor: "#D1FAE5",
    badgeText: "#059669",
    desc: "Perfect for visual content, product showcases, and engaging with your audience.",
    reasons: ["High engagement rates", "Great for product visuals", "Stories & Reels boost reach"],
    score: 92,
    bg: "#E1306C",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    badge: "Highly Recommended",
    badgeColor: "#D1FAE5",
    badgeText: "#059669",
    desc: "Ideal for thought leadership, B2B growth, and building professional credibility.",
    reasons: ["Reach decision makers", "Build brand authority", "Great for B2B marketing"],
    score: 88,
    bg: "#0A66C2",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    badge: "Recommended",
    badgeColor: "#EDE9FE",
    badgeText: "#6D28D9",
    desc: "Great for real-time updates, conversations, and brand awareness.",
    reasons: ["Real-time engagement", "Great for announcements", "Increase brand visibility"],
    score: 76,
    bg: "#000000",
  },
  {
    id: "youtube",
    name: "YouTube",
    badge: "Optional",
    badgeColor: "#FEF3C7",
    badgeText: "#D97706",
    desc: "Long-form videos, tutorials, product demos, and customer education.",
    reasons: ["SEO benefits", "Evergreen content", "Product demos"],
    score: 54,
    bg: "#FF0000",
  },
  {
    id: "tiktok",
    name: "TikTok",
    badge: "Optional",
    badgeColor: "#FEF3C7",
    badgeText: "#D97706",
    desc: "Short-form entertaining content that goes viral and grows brand awareness.",
    reasons: ["Viral potential", "Young audience", "Creative formats"],
    score: 48,
    bg: "#010101",
  },
  {
    id: "facebook",
    name: "Facebook",
    badge: "Optional",
    badgeColor: "#FEF3C7",
    badgeText: "#D97706",
    desc: "Community building, customer support, and sharing updates with your audience.",
    reasons: ["Large user base", "Community groups", "Paid ads ecosystem"],
    score: 32,
    bg: "#1877F2",
  },
];

export function Step3Platforms() {
  const { selectedPlatforms, togglePlatform, setStep, analysis } = useOnboarding();

  // Merge real scores from analysis into platform cards
  const platformsWithScores = PLATFORMS.map((p) => {
    const real = analysis?.platforms.find((ap) => ap.platform === p.id);
    const score = real ? real.score : p.score;
    const badge = score >= 80 ? "Highly Recommended" : score >= 60 ? "Recommended" : "Optional";
    const badgeColor = score >= 80 ? "#D1FAE5" : score >= 60 ? "#EDE9FE" : "#FEF3C7";
    const badgeText = score >= 80 ? "#059669" : score >= 60 ? "#6D28D9" : "#D97706";
    return { ...p, score, badge, badgeColor, badgeText };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0F0E1A] tracking-tight mb-1">Select Your Platforms 🚀</h1>
        <p className="text-sm text-[#6C6C8A]">Choose the platforms where you want AI to create and publish content.</p>
      </div>

      {/* Recommendation banner */}
      <div className="bg-[#EDE9FE] rounded-xl p-3 flex items-start gap-2 mb-6">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="#6D28D9" opacity=".3"/><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <div>
          <div className="text-xs font-bold text-[#6D28D9]">Recommended for your product</div>
          <div className="text-xs text-[#6C6C8A]">Based on our analysis, these platforms will help you reach your target audience effectively.</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 flex-1 overflow-auto">
        {platformsWithScores.map((p) => {
          const selected = selectedPlatforms.includes(p.id);
          return (
            <div
              key={p.id}
              onClick={() => togglePlatform(p.id)}
              className={`relative rounded-2xl p-4 border-2 cursor-pointer transition-all hover:shadow-[0_4px_16px_rgba(109,40,217,.1)] ${
                selected ? "border-[#6D28D9] bg-[rgba(109,40,217,.02)]" : "border-[#EAEAF4] bg-white"
              }`}
            >
              {/* Checkbox */}
              <div className={`absolute top-3 right-3 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selected ? "bg-[#6D28D9] border-[#6D28D9]" : "bg-white border-[#C8C8E0]"}`}>
                {selected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>

              {/* Icon */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold mb-3" style={{ background: p.bg }}>
                {p.name[0]}
              </div>
              <div className="text-sm font-bold text-[#0F0E1A] mb-1.5">{p.name}</div>
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full mb-2" style={{ background: p.badgeColor, color: p.badgeText }}>{p.badge}</span>
              <p className="text-[11px] text-[#6C6C8A] leading-relaxed mb-2">{p.desc}</p>
              <div className="text-[10px] font-semibold text-[#9898B8] mb-1">Why it&apos;s great for you</div>
              <div className="space-y-1">
                {p.reasons.map((r) => (
                  <div key={r} className="flex items-center gap-1.5 text-[11px] text-[#3D3D5C]">
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    {r}
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-[#9898B8] mb-1">
                  <span>Your Audience Match</span>
                  <span className="font-bold text-[#3D3D5C]">{p.score}%</span>
                </div>
                <div className="h-1 bg-[#F7F6FF] rounded-full overflow-hidden">
                  <div className="h-full bg-[#6D28D9] rounded-full" style={{ width: `${p.score}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#9898B8] text-center mt-3">ℹ You can add or remove platforms anytime from your settings.</p>

      <div className="flex items-center justify-between pt-4">
        <button onClick={() => setStep(2)} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-[#6C6C8A] border border-[#C8C8E0] rounded-xl hover:text-[#0F0E1A] transition-all">
          ← Back
        </button>
        <button
          onClick={() => setStep(4)}
          disabled={selectedPlatforms.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#6D28D9] text-white text-sm font-semibold rounded-xl hover:bg-[#5B21B6] hover:shadow-[0_6px_20px_rgba(109,40,217,.35)] transition-all disabled:opacity-50"
        >
          Continue to Connect Accounts →
        </button>
      </div>
    </div>
  );
}
