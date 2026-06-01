"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 1200, suffix: "+", label: "Founders using Marketify AI" },
  { value: 95, suffix: "%", label: "Less time on social media" },
  { value: 287, suffix: "%", label: "Average engagement increase" },
  { value: 12, suffix: "h", label: "Saved per founder per week" },
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const duration = 1800;
        const animate = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(ease * target));
          if (progress < 1) requestAnimationFrame(animate);
          else setCount(target);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function Stats() {
  return (
    <section className="py-20 px-5 md:px-20 bg-[#F7F6FF] border-y border-[#EAEAF4]">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="fu text-center bg-white rounded-2xl p-6 border border-[#EAEAF4] shadow-[0_2px_8px_rgba(0,0,0,.04)]">
            <div className="text-[clamp(28px,3vw,40px)] font-extrabold text-[#6D28D9] mb-2 tracking-tight">
              <CountUp target={s.value} suffix={s.suffix} />
            </div>
            <div className="text-sm text-[#6C6C8A] font-medium leading-snug">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
