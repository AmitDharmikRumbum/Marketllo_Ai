"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const colors = ["", "#DC2626", "#D97706", "#D97706", "#059669"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{ background: i <= score ? colors[score] : "#EAEAF4" }} />
        ))}
      </div>
      <span className="text-xs font-semibold" style={{ color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen bg-[#EEEAF8] flex items-center justify-center p-4">
      <div className="w-full max-w-[900px] grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(80,40,160,.13)]">
        <AuthLeftPanel />

        {/* Right: form */}
        <div className="bg-white px-10 py-11">
          <h1 className="text-2xl font-extrabold text-[#0F0E1A] tracking-tight mb-1">Create your account</h1>
          <p className="text-sm text-[#6C6C8A] mb-8">Start your 14-day free trial. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="text-xs font-semibold text-[#3D3D5C] uppercase tracking-wide mb-1.5 block">Full Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9898B8]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </span>
                <input
                  type="text"
                  required
                  placeholder="Alex Johnson"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#C8C8E0] rounded-[10px] text-[#0F0E1A] placeholder:text-[#9898B8] focus:outline-none focus:border-[#6D28D9] focus:shadow-[0_0_0_3px_rgba(109,40,217,.1)] transition-all"
                />
              </div>
            </div>

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
              <label className="text-xs font-semibold text-[#3D3D5C] uppercase tracking-wide mb-1.5 block">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9898B8]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-[#C8C8E0] rounded-[10px] text-[#0F0E1A] placeholder:text-[#9898B8] focus:outline-none focus:border-[#6D28D9] focus:shadow-[0_0_0_3px_rgba(109,40,217,.1)] transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9898B8] hover:text-[#6C6C8A]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d={showPass ? "M3 3l18 18M10.5 10.5A3 3 0 0013.5 13.5M6.5 6.5C4.5 8 3 10 3 12s3.6 7 9 7c1.8 0 3.4-.4 4.8-1.1M9 12a3 3 0 003 3M21 12c0-2-3.6-7-9-7-.5 0-1 0-1.5.1" : "M1 12s3.6-7 11-7 11 7 11 7-3.6 7-11 7-11-7-11-7z M12 9a3 3 0 100 6 3 3 0 000-6z"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-xs font-semibold text-[#3D3D5C] uppercase tracking-wide mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9898B8]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </span>
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-[#C8C8E0] rounded-[10px] text-[#0F0E1A] placeholder:text-[#9898B8] focus:outline-none focus:border-[#6D28D9] focus:shadow-[0_0_0_3px_rgba(109,40,217,.1)] transition-all"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9898B8] hover:text-[#6C6C8A]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d={showConfirm ? "M3 3l18 18M10.5 10.5A3 3 0 0013.5 13.5M6.5 6.5C4.5 8 3 10 3 12s3.6 7 9 7c1.8 0 3.4-.4 4.8-1.1M9 12a3 3 0 003 3M21 12c0-2-3.6-7-9-7-.5 0-1 0-1.5.1" : "M1 12s3.6-7 11-7 11 7 11 7-3.6 7-11 7-11-7-11-7z M12 9a3 3 0 100 6 3 3 0 000-6z"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#6D28D9] text-white text-sm font-semibold rounded-xl hover:bg-[#5B21B6] hover:shadow-[0_6px_20px_rgba(109,40,217,.35)] hover:-translate-y-px transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#EAEAF4]" />
            <span className="text-xs text-[#9898B8] font-medium">or sign up with</span>
            <div className="flex-1 h-px bg-[#EAEAF4]" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Google", icon: "G" },
              { label: "LinkedIn", icon: "in" },
              { label: "Apple", icon: "🍎" },
            ].map((s) => (
              <button key={s.label} className="flex items-center justify-center gap-1.5 py-2.5 border border-[#C8C8E0] rounded-[10px] text-xs font-semibold text-[#3D3D5C] hover:border-[#6D28D9] hover:text-[#6D28D9] transition-all">
                <span className="font-bold">{s.icon}</span> {s.label}
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-[#9898B8] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#6D28D9] font-semibold hover:underline">Login</Link>
          </p>
          <p className="text-center text-[11px] text-[#9898B8] mt-2">
            By signing up you agree to our{" "}
            <a href="#" className="text-[#6D28D9] hover:underline">Terms</a> and{" "}
            <a href="#" className="text-[#6D28D9] hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
