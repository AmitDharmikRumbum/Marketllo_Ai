export function AuthLeftPanel() {
  return (
    <div
      className="hidden md:flex flex-col p-10 relative overflow-hidden"
      style={{ background: "linear-gradient(155deg, #EDE9FE 0%, #E4DCFF 50%, #EAE0FF 100%)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-auto">
        <div className="w-8 h-8 bg-[#6D28D9] rounded-lg flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 15 15" fill="white">
            <path d="M7.5 1L13 4v7l-5.5 3L2 11V4L7.5 1z" opacity=".3"/>
            <path d="M7.5 1L13 4l-5.5 3L2 4l5.5-3z"/>
          </svg>
        </div>
        <span className="font-extrabold text-base text-[#0F0E1A]">Marketify AI</span>
      </div>

      {/* Heading */}
      <div className="my-8">
        <h2 className="text-2xl font-extrabold text-[#0F0E1A] leading-tight mb-3">
          Your <span className="text-[#6D28D9]">AI</span> Marketing<br />Manager
        </h2>
        <p className="text-sm text-[#6C6C8A] leading-relaxed max-w-[260px]">
          Add your product and let AI understand your business to create a powerful marketing strategy.
        </p>
      </div>

      {/* Robot mascot */}
      <div className="animate-bob mx-auto mb-8">
        <div className="relative w-28 h-28">
          {/* Robot body */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-[#6D28D9] rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(109,40,217,.3)]">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="9" cy="10" r="2" fill="white"/>
                  <circle cx="15" cy="10" r="2" fill="white"/>
                  <path d="M8 15s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
          {/* Floating icons */}
          <div className="absolute -top-2 -right-2 w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center animate-float">
            <span className="text-lg">📊</span>
          </div>
          <div className="absolute -bottom-2 -left-2 w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center animate-float-slow">
            <span className="text-lg">🚀</span>
          </div>
        </div>
      </div>

      {/* Trust box */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-[#EDE9FE] rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z" stroke="#6D28D9" strokeWidth="1.8" fill="none"/>
              <path d="M9 12l2 2 4-4" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-[#0F0E1A]">Your data is safe and secure</div>
            <div className="text-[11px] text-[#6C6C8A]">We never post anything without your approval.</div>
          </div>
        </div>
        <div className="flex -space-x-1.5">
          {["#6D28D9","#059669","#D97706","#DC2626","#0891B2"].map((c) => (
            <div key={c} className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-bold" style={{ background: c }}>
              {c[1].toUpperCase()}
            </div>
          ))}
          <div className="w-6 h-6 rounded-full border-2 border-white bg-[#EDE9FE] flex items-center justify-center text-[8px] font-semibold text-[#6D28D9]">
            +K
          </div>
        </div>
        <div className="text-[11px] text-[#6C6C8A] mt-1.5 font-medium">1,200+ founders trust Marketify AI</div>
      </div>
    </div>
  );
}
