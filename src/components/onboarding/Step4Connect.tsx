"use client";

import { useOnboarding } from "@/store/onboarding";

const PLATFORM_CONFIG: Record<string, { name: string; bg: string; desc: string; benefit: string; features: string[]; handle: string }> = {
  instagram: {
    name: "Instagram",
    bg: "#E1306C",
    desc: "Connect your Instagram Business or Creator account",
    benefit: "Best for visual content, brand awareness & engagement",
    features: ["Publish Posts & Reels", "Stories", "Analytics", "Engagement Insights"],
    handle: "@yourbrand",
  },
  linkedin: {
    name: "LinkedIn",
    bg: "#0A66C2",
    desc: "Connect your LinkedIn Company Page",
    benefit: "Great for B2B marketing, thought leadership & growth",
    features: ["Publish Posts", "Company Updates", "Analytics", "Engagement Insights"],
    handle: "YourCompany",
  },
  twitter: {
    name: "X (Twitter)",
    bg: "#000000",
    desc: "Connect your X (Twitter) account",
    benefit: "Perfect for real-time updates, conversations & visibility",
    features: ["Publish Tweets", "Thread Tweets", "Analytics", "Engagement Insights"],
    handle: "@yourbrand",
  },
  youtube: {
    name: "YouTube",
    bg: "#FF0000",
    desc: "Connect your YouTube Channel",
    benefit: "Great for long-form content, tutorials & SEO",
    features: ["Upload Videos", "Shorts", "Analytics", "Engagement Insights"],
    handle: "@yourchannel",
  },
  tiktok: {
    name: "TikTok",
    bg: "#010101",
    desc: "Connect your TikTok account",
    benefit: "Perfect for viral short-form video content",
    features: ["Publish Videos", "Analytics", "Engagement Insights"],
    handle: "@yourbrand",
  },
  facebook: {
    name: "Facebook",
    bg: "#1877F2",
    desc: "Connect your Facebook Page",
    benefit: "Great for community building and customer engagement",
    features: ["Publish Posts", "Stories", "Analytics", "Engagement Insights"],
    handle: "@yourpage",
  },
};

export function Step4Connect() {
  const { selectedPlatforms, connectedAccounts, connectAccount, setStep } = useOnboarding();

  const handleConnect = (platform: string) => {
    connectAccount(platform);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0F0E1A] tracking-tight mb-1">Connect Your Social Accounts 🔗</h1>
        <p className="text-sm text-[#6C6C8A]">Connect your social media accounts so AI can create and publish content for you.</p>
      </div>

      {/* Security banner */}
      <div className="flex items-center gap-3 bg-[#F7F6FF] border border-[#EAEAF4] rounded-xl p-4 mb-5">
        <div className="w-8 h-8 bg-[#EDE9FE] rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z" stroke="#6D28D9" strokeWidth="1.8" fill="none"/><path d="M9 12l2 2 4-4" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div>
          <div className="text-sm font-bold text-[#0F0E1A]">100% Secure Connection</div>
          <div className="text-xs text-[#6C6C8A]">We use official OAuth connections. We never store your passwords.</div>
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-auto">
        {selectedPlatforms.map((id) => {
          const cfg = PLATFORM_CONFIG[id];
          if (!cfg) return null;
          const connected = connectedAccounts.includes(id);
          return (
            <div key={id} className="flex items-center gap-4 bg-white border border-[#EAEAF4] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,.04)]">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: cfg.bg }}>
                {cfg.name[0]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-[#0F0E1A]">{cfg.name}</span>
                  <span className="px-2 py-0.5 bg-[#EDE9FE] text-[#6D28D9] text-[10px] font-bold rounded-full">Recommended</span>
                </div>
                <p className="text-xs text-[#6C6C8A] mb-2">{cfg.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {cfg.features.map((f) => (
                    <span key={f} className="flex items-center gap-1 text-[11px] text-[#059669] font-medium">
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefit */}
              <div className="hidden lg:flex items-center bg-[#F7F6FF] rounded-xl px-3 py-2 max-w-[180px] flex-shrink-0">
                <div className="flex items-start gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="text-[11px] text-[#3D3D5C] leading-snug">{cfg.benefit}</span>
                </div>
              </div>

              {/* Connect button */}
              <div className="flex-shrink-0 text-center">
                <button
                  onClick={() => handleConnect(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                    connected
                      ? "bg-[#D1FAE5] text-[#059669] cursor-default"
                      : "text-white hover:opacity-90 hover:shadow-[0_4px_16px_rgba(0,0,0,.2)]"
                  }`}
                  style={connected ? {} : { background: cfg.bg }}
                >
                  {connected ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      Connected
                    </>
                  ) : (
                    <>Connect {cfg.name}</>
                  )}
                </button>
                <div className="flex items-center gap-1 justify-center mt-1">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z" stroke="#9898B8" strokeWidth="1.6" fill="none"/></svg>
                  <span className="text-[10px] text-[#9898B8]">Secure OAuth</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#9898B8] text-center mt-3">ℹ You can connect or disconnect accounts anytime from Settings.</p>

      <div className="flex items-center justify-between pt-4">
        <button onClick={() => setStep(3)} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-[#6C6C8A] border border-[#C8C8E0] rounded-xl hover:text-[#0F0E1A] transition-all">
          ← Back
        </button>
        <button onClick={() => setStep(5)} className="flex items-center gap-2 px-6 py-2.5 bg-[#6D28D9] text-white text-sm font-semibold rounded-xl hover:bg-[#5B21B6] hover:shadow-[0_6px_20px_rgba(109,40,217,.35)] transition-all">
          Continue to AI Strategy →
        </button>
      </div>
    </div>
  );
}
