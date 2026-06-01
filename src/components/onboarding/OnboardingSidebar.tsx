"use client";

import { useOnboarding } from "@/store/onboarding";

const steps = [
  { number: 1, title: "Add Product", subtitle: "Enter your details" },
  { number: 2, title: "AI Analysis", subtitle: "Analyzing your product" },
  { number: 3, title: "Select Platforms", subtitle: "Choose where to grow" },
  { number: 4, title: "Connect Accounts", subtitle: "Link your social accounts" },
  { number: 5, title: "AI Strategy Setup", subtitle: "Customize your strategy" },
];

const sidebarContext: Record<number, { title: string; items: string[]; note?: string }> = {
  1: {
    title: "Let's add your startup 🚀",
    items: ["Add your product details and let AI understand your business to create a powerful marketing strategy."],
  },
  2: {
    title: "Analyzing your product 👋",
    items: ["Reading website content", "Analyzing product positioning", "Identifying target audience", "Researching competitors", "Generating recommendations"],
    note: "Our AI is studying your website and understanding your business...",
  },
  3: {
    title: "We'll create content that fits each platform perfectly",
    items: ["Platform-specific content", "Best time to post", "Audience insights", "Higher engagement"],
  },
  4: {
    title: "Secure & Private",
    items: ["We use official API connections.", "Your data is safe with us."],
  },
  5: {
    title: "Almost there! 🎉",
    items: ["Review and customize your AI strategy.", "You can change this anytime."],
  },
};

export function OnboardingSidebar() {
  const { step } = useOnboarding();
  const ctx = sidebarContext[step];

  return (
    <aside className="w-[240px] flex-shrink-0 bg-white border-r border-[#EAEAF4] flex flex-col p-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-7 h-7 bg-[#6D28D9] rounded-lg flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 15 15" fill="white"><path d="M7.5 1L13 4v7l-5.5 3L2 11V4L7.5 1z" opacity=".3"/><path d="M7.5 1L13 4l-5.5 3L2 4l5.5-3z"/></svg>
        </div>
        <span className="font-extrabold text-sm text-[#0F0E1A]">Marketify AI</span>
      </div>

      {/* Stepper */}
      <div className="flex flex-col gap-0 mb-8">
        {steps.map((s, i) => (
          <div key={s.number} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  s.number < step
                    ? "bg-[#6D28D9] text-white"
                    : s.number === step
                    ? "bg-[#6D28D9] text-white shadow-[0_0_0_3px_rgba(109,40,217,.15)]"
                    : "bg-[#F7F6FF] text-[#9898B8] border border-[#EAEAF4]"
                }`}
              >
                {s.number < step ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  s.number
                )}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 my-1 relative overflow-hidden" style={{ minHeight: 20, background: "#EAEAF4" }}>
                  <div
                    className="absolute top-0 left-0 w-full transition-all duration-[1.4s]"
                    style={{ height: s.number < step ? "100%" : "0%", background: "#6D28D9", transitionTimingFunction: "cubic-bezier(.4,0,.2,1)" }}
                  />
                </div>
              )}
            </div>
            <div className="pb-5">
              <div className={`text-xs font-bold ${s.number === step ? "text-[#6D28D9]" : s.number < step ? "text-[#0F0E1A]" : "text-[#9898B8]"}`}>
                {s.title}
              </div>
              <div className="text-[11px] text-[#9898B8] mt-0.5">{s.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Context card */}
      <div className="flex-1 flex flex-col">
        <div className="animate-bob mb-4 flex justify-center">
          <div className="w-16 h-16 bg-[#6D28D9] rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(109,40,217,.25)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="10" r="2" fill="white"/>
              <circle cx="15" cy="10" r="2" fill="white"/>
              <path d="M8 15s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="bg-[#F7F6FF] rounded-xl p-3 mb-3">
          <div className="text-xs font-bold text-[#0F0E1A] mb-2">{ctx.title}</div>
          {step === 2 ? (
            <div className="space-y-1.5">
              {ctx.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-[#3D3D5C]">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#D1FAE5] flex items-center justify-center flex-shrink-0">
                    <svg width="7" height="7" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </span>
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#6C6C8A] leading-relaxed">{ctx.items[0]}</p>
          )}
        </div>
      </div>

      {/* Help */}
      <div className="bg-[#6D28D9] rounded-xl p-3 text-white">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">?</div>
          <span className="text-xs font-bold">Need help?</span>
        </div>
        <p className="text-[11px] text-white/80 leading-relaxed">We&apos;ll help you set the perfect strategy for your startup.</p>
      </div>
    </aside>
  );
}
