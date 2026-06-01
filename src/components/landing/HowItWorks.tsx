"use client";

import { useEffect, useRef } from "react";

const steps = [
  {
    number: "1",
    title: "Add Your Product",
    desc: "Enter your website URL. Our AI scrapes and analyzes your product, audience, and positioning in seconds.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#6D28D9" strokeWidth="1.8"/>
        <path d="M9 12h6M12 9v6" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: "2",
    title: "AI Analyzes Everything",
    desc: "Claude AI identifies your product category, target audience, best platforms, and optimal content style.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    number: "3",
    title: "Content Gets Created",
    desc: "AI generates posts, reels (with voiceover + music), carousels, and memes — platform-optimized daily.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="#6D28D9" strokeWidth="1.8"/>
        <path d="M10 8l6 4-6 4V8z" fill="#6D28D9"/>
      </svg>
    ),
  },
  {
    number: "4",
    title: "Learns & Optimizes",
    desc: "Every week, AI reviews what performed best and adapts your content strategy automatically.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 12h18M3 12l4-4m-4 4l4 4" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12l-4-4m4 4l-4 4" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export function HowItWorks() {
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            const line = linesRef.current[Number((entry.target as HTMLElement).dataset.index)];
            if (line) {
              setTimeout(() => { line.style.width = "100%"; }, 400);
            }
          }
        });
      },
      { threshold: 0.3 }
    );
    document.querySelectorAll(".fu").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="py-24 px-5 md:px-20 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <div className="fu inline-flex items-center gap-2 px-3 py-1.5 bg-[#EDE9FE] rounded-full text-xs font-semibold text-[#6D28D9] mb-4">
            How It Works
          </div>
          <h2 className="fu text-[clamp(28px,3vw,42px)] font-extrabold text-[#0F0E1A] tracking-tight mb-4">
            Set up once. AI runs forever.
          </h2>
          <p className="fu text-base text-[#6C6C8A] max-w-[500px] mx-auto leading-relaxed">
            From product URL to published content in under 5 minutes. Then AI keeps running on its own.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="fu relative" data-index={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+32px)] right-0 h-px bg-[#EAEAF4] z-0">
                  <div
                    ref={(el) => { linesRef.current[i] = el; }}
                    className="h-full bg-[#6D28D9] transition-all duration-[1.4s]"
                    style={{ width: "0%", transitionTimingFunction: "cubic-bezier(.4,0,.2,1)" }}
                  />
                </div>
              )}

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#EDE9FE] flex items-center justify-center mb-4 relative">
                  {step.icon}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#6D28D9] text-white text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0F0E1A] mb-2">{step.title}</h3>
                <p className="text-sm text-[#6C6C8A] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
