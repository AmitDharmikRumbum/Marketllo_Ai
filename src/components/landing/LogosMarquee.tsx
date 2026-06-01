export function LogosMarquee() {
  const platforms = [
    { name: "Instagram", color: "#E1306C" },
    { name: "LinkedIn", color: "#0A66C2" },
    { name: "X (Twitter)", color: "#000000" },
    { name: "YouTube", color: "#FF0000" },
    { name: "TikTok", color: "#010101" },
    { name: "Facebook", color: "#1877F2" },
    { name: "Pinterest", color: "#E60023" },
    { name: "Threads", color: "#101010" },
  ];

  return (
    <section className="py-10 bg-[#F7F6FF] border-y border-[#EAEAF4] overflow-hidden">
      <p className="text-center text-xs font-semibold text-[#9898B8] uppercase tracking-widest mb-6">
        Publishes to all major platforms
      </p>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #F7F6FF, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #F7F6FF, transparent)" }} />

        <div className="flex animate-marquee whitespace-nowrap">
          {[...platforms, ...platforms].map((p, i) => (
            <div key={i} className="inline-flex items-center gap-2.5 mx-6 px-5 py-2.5 bg-white rounded-xl border border-[#EAEAF4] shadow-[0_1px_4px_rgba(0,0,0,.04)] flex-shrink-0">
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <span className="text-sm font-semibold text-[#3D3D5C]">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
