export function Footer() {
  return (
    <footer className="bg-[#0F0E1A] text-white py-16 px-5 md:px-20">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-[#6D28D9] rounded-lg flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 15 15" fill="white"><path d="M7.5 1L13 4v7l-5.5 3L2 11V4L7.5 1z" opacity=".3"/><path d="M7.5 1L13 4l-5.5 3L2 4l5.5-3z"/></svg>
              </div>
              <span className="font-extrabold text-base">Marketify AI</span>
            </div>
            <p className="text-sm text-[#9898B8] leading-relaxed mb-4">AI-powered marketing manager for startup founders.</p>
            <div className="flex gap-3">
              {["𝕏", "in", "ig"].map((icon) => (
                <div key={icon} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white/70 hover:bg-[#6D28D9] hover:text-white cursor-pointer transition-all">
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
            { title: "Support", links: ["Help Center", "Contact", "Privacy", "Terms"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#9898B8] mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-[#9898B8] hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#9898B8]">© 2025 Marketify AI. All rights reserved.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Get AI marketing tips →"
              className="px-4 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-[#9898B8] focus:outline-none focus:border-[#6D28D9] w-56"
            />
            <button className="px-4 py-2 text-sm font-semibold bg-[#6D28D9] text-white rounded-lg hover:bg-[#5B21B6] transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
