"use client";

import { useOnboarding } from "@/store/onboarding";

const PLATFORM_BG: Record<string, string> = {
  instagram: "#E1306C",
  linkedin: "#0A66C2",
  twitter: "#000000",
  youtube: "#FF0000",
  tiktok: "#010101",
  facebook: "#1877F2",
};

export function Step2Analysis() {
  const { analysis, setStep } = useOnboarding();

  const handleContinue = () => {
    if (analysis) {
      const recommended = analysis.platforms
        .filter((p) => p.score >= 80)
        .map((p) => p.platform);
      useOnboarding.setState({ selectedPlatforms: recommended.length > 0 ? recommended : [analysis.platforms[0]?.platform] });
    }
    setStep(3);
  };

  if (!analysis) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full">
        <div className="text-sm text-[#6C6C8A]">No analysis data found. Please go back and analyze your product.</div>
        <button onClick={() => setStep(1)} className="mt-4 px-6 py-2.5 text-sm font-semibold text-white bg-[#6D28D9] rounded-xl">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F0E1A] tracking-tight mb-1">
            AI Product Analysis ✨
          </h1>
          <p className="text-sm text-[#6C6C8A]">
            Here&apos;s what our AI discovered about <span className="font-semibold text-[#0F0E1A]">{analysis.productName}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D1FAE5] rounded-full">
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span className="text-xs font-bold text-[#059669]">Analysis Complete</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 overflow-auto">

        {/* Product Category */}
        <div className="bg-white border border-[#EAEAF4] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.04)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h7" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <span className="text-sm font-bold text-[#0F0E1A]">Product Category</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-extrabold text-[#6D28D9]">{analysis.category}</span>
            <span className="px-2 py-0.5 bg-[#D1FAE5] text-[#059669] text-xs font-bold rounded-full">
              {analysis.categoryMatch}% Match
            </span>
          </div>
          <p className="text-xs text-[#6C6C8A] mb-3 leading-relaxed">{analysis.tagline}</p>
          {analysis.otherCategories.length > 0 && (
            <>
              <div className="text-xs text-[#9898B8] font-semibold mb-2">Other relevant categories</div>
              <div className="flex flex-wrap gap-2">
                {analysis.otherCategories.map((c) => (
                  <span key={c} className="px-3 py-1 bg-[#F7F6FF] border border-[#EAEAF4] rounded-full text-xs text-[#3D3D5C] font-medium">{c}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Target Audience */}
        <div className="bg-white border border-[#EAEAF4] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.04)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="3" stroke="#6D28D9" strokeWidth="1.6" fill="none"/><path d="M3 21v-2a5 5 0 0110 0v2" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round" fill="none"/><circle cx="17" cy="10" r="2" stroke="#6D28D9" strokeWidth="1.5" fill="none"/><path d="M20 21v-1a3 3 0 00-5 0v1" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
            </div>
            <span className="text-sm font-bold text-[#0F0E1A]">Target Audience</span>
          </div>
          <div className="text-base font-extrabold text-[#6D28D9] mb-1">{analysis.audience.title}</div>
          <p className="text-xs text-[#6C6C8A] mb-3 leading-relaxed">{analysis.audience.description}</p>
          <div className="space-y-1.5">
            {[
              { label: "Company Size", value: analysis.audience.companySize },
              { label: "Roles", value: analysis.audience.roles },
              { label: "Industry", value: analysis.audience.industry },
              { label: "Location", value: analysis.audience.location },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-2 text-xs">
                <span className="text-[#9898B8] font-semibold w-24 flex-shrink-0">{row.label}</span>
                <span className="text-[#3D3D5C]">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Platforms */}
        <div className="bg-white border border-[#EAEAF4] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.04)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="#6D28D9" strokeWidth="1.6"/><circle cx="6" cy="12" r="3" stroke="#6D28D9" strokeWidth="1.6"/><circle cx="18" cy="19" r="3" stroke="#6D28D9" strokeWidth="1.6"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="#6D28D9" strokeWidth="1.6"/></svg>
            </div>
            <span className="text-sm font-bold text-[#0F0E1A]">Suggested Platforms</span>
          </div>
          <p className="text-xs text-[#9898B8] mb-3">Platforms where your audience is most active</p>
          <div className="space-y-2.5">
            {analysis.platforms.slice(0, 5).map((p) => (
              <div key={p.platform} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{ background: PLATFORM_BG[p.platform] || "#6D28D9" }}
                >
                  {p.name[0]}
                </div>
                <span className="text-xs text-[#3D3D5C] w-20 truncate">{p.name}</span>
                <div className="flex-1 h-1.5 bg-[#F7F6FF] rounded-full overflow-hidden">
                  <div className="h-full bg-[#6D28D9] rounded-full transition-all duration-700" style={{ width: `${p.score}%` }} />
                </div>
                <span className="text-xs font-bold text-[#3D3D5C] w-8 text-right">{p.score}%</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#9898B8] mt-3">ℹ We&apos;ll focus on the top 3 platforms for best results.</p>
        </div>

        {/* Content Style */}
        <div className="bg-white border border-[#EAEAF4] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,.04)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-sm font-bold text-[#0F0E1A]">Content Style</span>
          </div>
          <div className="text-base font-extrabold text-[#6D28D9] mb-1">{analysis.contentStyle.name}</div>
          <p className="text-xs text-[#6C6C8A] mb-3 leading-relaxed">{analysis.contentStyle.description}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {analysis.contentStyle.tags.map((t) => (
              <span key={t} className="px-2.5 py-1 bg-[#EDE9FE] text-[#6D28D9] text-xs font-semibold rounded-full">{t}</span>
            ))}
          </div>
          <div className="text-xs font-semibold text-[#9898B8] mb-2">Content pillars we recommend</div>
          <div className="space-y-1.5">
            {analysis.contentStyle.pillars.map((p) => (
              <div key={p} className="flex items-center gap-1.5 text-xs text-[#3D3D5C]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6D28D9] flex-shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between pt-5">
        <button onClick={() => setStep(1)} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-[#6C6C8A] border border-[#C8C8E0] rounded-xl hover:text-[#0F0E1A] hover:border-[#0F0E1A] transition-all">
          ← Back
        </button>
        <button
          onClick={handleContinue}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#6D28D9] text-white text-sm font-semibold rounded-xl hover:bg-[#5B21B6] hover:shadow-[0_6px_20px_rgba(109,40,217,.35)] transition-all"
        >
          Looks Good, Continue →
        </button>
      </div>
    </div>
  );
}
