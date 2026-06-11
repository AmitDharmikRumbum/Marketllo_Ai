"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";

// Inner component that uses useSearchParams — must be inside <Suspense>
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, remember: form.remember }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/projects");
    } catch {
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white px-10 py-11">
      <h1 className="text-2xl font-extrabold text-[#0F0E1A] tracking-tight mb-1">Welcome back</h1>
      <p className="text-sm text-[#6C6C8A] mb-8">Sign in to your Marketify AI account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="text-xs font-semibold text-[#3D3D5C] uppercase tracking-wide mb-1.5 block">Email</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9898B8]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </span>
            <input
              type="email"
              required
              placeholder="alex@startup.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#C8C8E0] rounded-[10px] text-[#0F0E1A] placeholder:text-[#9898B8] focus:outline-none focus:border-[#6D28D9] focus:shadow-[0_0_0_3px_rgba(109,40,217,.1)] transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#3D3D5C] uppercase tracking-wide">Password</label>
            <a href="#" className="text-xs font-semibold text-[#6D28D9] hover:underline">Forgot password?</a>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9898B8]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </span>
            <input
              type={showPass ? "text" : "password"}
              required
              placeholder="Your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-[#C8C8E0] rounded-[10px] text-[#0F0E1A] placeholder:text-[#9898B8] focus:outline-none focus:border-[#6D28D9] focus:shadow-[0_0_0_3px_rgba(109,40,217,.1)] transition-all"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9898B8] hover:text-[#6C6C8A]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d={showPass ? "M3 3l18 18M10.5 10.5A3 3 0 0013.5 13.5" : "M1 12s3.6-7 11-7 11 7 11 7-3.6 7-11 7-11-7-11-7z M12 9a3 3 0 100 6 3 3 0 000-6z"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            checked={form.remember}
            onChange={(e) => setForm({ ...form, remember: e.target.checked })}
            className="w-4 h-4 accent-[#6D28D9] cursor-pointer"
          />
          <label htmlFor="remember" className="text-sm text-[#6C6C8A] cursor-pointer select-none">Remember me</label>
        </div>

        {(error || oauthError) && (
          <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600">
            {error || "Google sign-in failed. Please try again."}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#6D28D9] text-white text-sm font-semibold rounded-xl hover:bg-[#5B21B6] hover:shadow-[0_6px_20px_rgba(109,40,217,.35)] hover:-translate-y-px transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In →"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-[#EAEAF4]" />
        <span className="text-xs text-[#9898B8] font-medium">or sign in with</span>
        <div className="flex-1 h-px bg-[#EAEAF4]" />
      </div>

      {/* Social */}
      <a
        href="/api/auth/google"
        className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#C8C8E0] rounded-[10px] text-xs font-semibold text-[#3D3D5C] hover:border-[#6D28D9] hover:text-[#6D28D9] transition-all"
      >
        <span className="font-bold">G</span> Continue with Google
      </a>

      <p className="text-center text-xs text-[#9898B8] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#6D28D9] font-semibold hover:underline">Sign up free</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#EEEAF8] flex items-center justify-center p-4">
      <div className="w-full max-w-[900px] grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(80,40,160,.13)]">
        <AuthLeftPanel />
        <Suspense fallback={<div className="bg-white px-10 py-11 flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#6D28D9] border-t-transparent rounded-full animate-spin" /></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
