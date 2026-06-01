"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 px-5 md:px-20 flex items-center justify-between transition-all duration-300 border-b border-[#EAEAF4] ${
        scrolled ? "bg-white/92 backdrop-blur-[16px]" : "bg-[#F7F6FF]/80 backdrop-blur-[16px]"
      }`}
    >
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <div className="w-[30px] h-[30px] bg-[#6D28D9] rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="white">
            <path d="M7.5 1L13 4v7l-5.5 3L2 11V4L7.5 1z" opacity=".3"/>
            <path d="M7.5 1L13 4l-5.5 3L2 4l5.5-3z"/>
            <path d="M7.5 7v6M13 4l-5.5 3M2 4l5.5 3" stroke="white" strokeWidth="1.2" fill="none"/>
          </svg>
        </div>
        <span className="text-[17px] font-extrabold text-[#0F0E1A] tracking-tight">Marketify AI</span>
      </Link>

      <ul className="hidden md:flex list-none gap-7">
        {["Features", "How it Works", "Pricing", "Blog"].map((item) => (
          <li key={item}>
            <a href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-sm font-medium text-[#6C6C8A] hover:text-[#0F0E1A] transition-colors no-underline">
              {item}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2">
        <Link href="/login" className="px-4 py-2 text-sm font-semibold text-[#6C6C8A] rounded-[10px] hover:text-[#0F0E1A] hover:bg-[#F7F6FF] transition-all">
          Login
        </Link>
        <Link href="/register" className="px-4 py-2.5 text-sm font-semibold text-white bg-[#6D28D9] rounded-[10px] hover:bg-[#5B21B6] hover:shadow-[0_6px_20px_rgba(109,40,217,.3)] hover:-translate-y-px transition-all">
          Get Started Free
        </Link>
      </div>
    </nav>
  );
}
