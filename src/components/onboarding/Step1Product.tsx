"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/store/onboarding";

function isValidUrl(url: string) {
  try { new URL(url); return true; } catch { return false; }
}

const LOADING_STEPS = [
  "Reading website content...",
  "Scraping app store data...",
  "Merging data sources...",
  "Identifying target audience...",
  "Generating recommendations...",
];

export function Step1Product() {
  const router = useRouter();
  const { product, setProduct, setStep, setAnalysis, setProductId } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [prefilling, setPrefilling] = useState(false);
  const prefillRef = useRef<string>("");

  const handleUrlBlur = async () => {
    const url = product.websiteUrl;
    if (!isValidUrl(url)) return;
    if (prefillRef.current === url) return;
    prefillRef.current = url;

    setPrefilling(true);
    try {
      const res = await fetch("/api/prefill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl: url }),
      });
      const data = await res.json();
      if (data.description) {
        setProduct({ description: data.description });
      }
    } catch {
      // silently fail — user can type manually
    }
    setPrefilling(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Animate loading steps
    for (let i = 0; i < LOADING_STEPS.length; i++) {
      setLoadingStep(i);
      await new Promise((r) => setTimeout(r, 600));
    }

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl: product.websiteUrl, appstoreUrl: product.appstoreUrl, playstoreUrl: product.playstoreUrl, description: product.description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed. Please try again.");
        setLoading(false);
        return;
      }

      setAnalysis(data.analysis);
      setProductId(data.productId ?? null);
      setStep(2);
    } catch {
      setError("Network error. Please check your connection and try again.");
    }

    setLoading(false);
  };

  return (
    <div className="p-8 h-full flex flex-col relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-r-3xl">
          <div className="w-16 h-16 bg-[#6D28D9] rounded-2xl flex items-center justify-center mb-5 animate-bob shadow-[0_8px_24px_rgba(109,40,217,.3)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="10" r="2" fill="white"/><circle cx="15" cy="10" r="2" fill="white"/><path d="M8 15s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div className="text-base font-extrabold text-[#0F0E1A] mb-2">Analyzing your product...</div>
          <div className="text-sm text-[#6D28D9] font-semibold mb-6">{LOADING_STEPS[loadingStep]}</div>
          <div className="w-64 space-y-2">
            {LOADING_STEPS.map((step, i) => (
              <div key={step} className={`flex items-center gap-2 text-xs transition-all ${i <= loadingStep ? "text-[#3D3D5C]" : "text-[#C8C8E0]"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${i < loadingStep ? "bg-[#D1FAE5]" : i === loadingStep ? "bg-[#EDE9FE]" : "bg-[#F7F6FF]"}`}>
                  {i < loadingStep
                    ? <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    : i === loadingStep
                    ? <div className="w-2 h-2 rounded-full bg-[#6D28D9] animate-pulsedot" />
                    : null}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#0F0E1A] tracking-tight mb-1">Add Your Product</h1>
        <p className="text-sm text-[#6C6C8A]">Enter your product details so our AI can understand your business better.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
        {/* Website URL */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <label className="text-sm font-bold text-[#0F0E1A]">Website URL</label>
            <span className="text-xs text-[#9898B8]">Add your website link</span>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9898B8]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M2 12h20M12 2c-2.5 3-4 6.3-4 10s1.5 7 4 10M12 2c2.5 3 4 6.3 4 10s-1.5 7-4 10" stroke="currentColor" strokeWidth="1.6"/></svg>
            </span>
            <input
              type="url"
              required
              placeholder="https://yourwebsite.com"
              value={product.websiteUrl}
              onChange={(e) => setProduct({ websiteUrl: e.target.value })}
              onBlur={handleUrlBlur}
              className="w-full pl-10 pr-10 py-3 text-sm border border-[#C8C8E0] rounded-xl text-[#0F0E1A] placeholder:text-[#9898B8] focus:outline-none focus:border-[#6D28D9] focus:shadow-[0_0_0_3px_rgba(109,40,217,.1)] transition-all"
            />
            {isValidUrl(product.websiteUrl) && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#D1FAE5"/><path d="M5 8l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            )}
          </div>
        </div>

        {/* App Store URL */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <label className="text-sm font-bold text-[#0F0E1A]">App Store URL</label>
            <span className="text-xs text-[#9898B8] bg-[#F7F6FF] px-2 py-0.5 rounded-full">(Optional)</span>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9898B8]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor" opacity=".3"/><path d="M17 8H7l5-5 5 5zm0 8H7l5 5 5-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
            </span>
            <input
              type="url"
              placeholder="https://apps.apple.com/app/..."
              value={product.appstoreUrl}
              onChange={(e) => setProduct({ appstoreUrl: e.target.value })}
              className="w-full pl-10 pr-4 py-3 text-sm border border-[#C8C8E0] rounded-xl text-[#0F0E1A] placeholder:text-[#9898B8] focus:outline-none focus:border-[#6D28D9] focus:shadow-[0_0_0_3px_rgba(109,40,217,.1)] transition-all"
            />
          </div>
        </div>

        {/* Play Store URL */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <label className="text-sm font-bold text-[#0F0E1A]">Play Store URL</label>
            <span className="text-xs text-[#9898B8] bg-[#F7F6FF] px-2 py-0.5 rounded-full">(Optional)</span>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9898B8]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 9-18 9V3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
            </span>
            <input
              type="url"
              placeholder="https://play.google.com/store/apps/..."
              value={product.playstoreUrl}
              onChange={(e) => setProduct({ playstoreUrl: e.target.value })}
              className="w-full pl-10 pr-4 py-3 text-sm border border-[#C8C8E0] rounded-xl text-[#0F0E1A] placeholder:text-[#9898B8] focus:outline-none focus:border-[#6D28D9] focus:shadow-[0_0_0_3px_rgba(109,40,217,.1)] transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-[#0F0E1A]">Product Description</label>
              <span className="text-xs text-[#9898B8]">Describe what your product does</span>
            </div>
            {prefilling && (
              <span className="flex items-center gap-1.5 text-xs text-[#6D28D9] font-semibold">
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10"/></svg>
                AI filling...
              </span>
            )}
          </div>
          <div className="relative">
            <textarea
              rows={5}
              maxLength={1000}
              placeholder={prefilling ? "AI is reading your website..." : "Example: Taskllo is a simple project management tool for remote teams.\nIt helps teams organize tasks, collaborate in real-time, and get work done faster."}
              value={product.description}
              onChange={(e) => setProduct({ description: e.target.value })}
              className={`w-full px-4 py-3 text-sm border rounded-xl text-[#0F0E1A] placeholder:text-[#9898B8] resize-none focus:outline-none focus:border-[#6D28D9] focus:shadow-[0_0_0_3px_rgba(109,40,217,.1)] transition-all ${prefilling ? "border-[#6D28D9] bg-[#FDFCFF]" : "border-[#C8C8E0]"}`}
            />
            <span className="absolute bottom-3 right-3 text-xs text-[#9898B8]">{product.description.length}/1000</span>
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-[#F7F6FF] border border-[#EAEAF4] rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-[#EDE9FE] rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div className="text-xs font-bold text-[#0F0E1A] mb-0.5">What happens next?</div>
            <div className="text-xs text-[#6C6C8A]">Our AI will analyze your product, audience, and market to create a custom marketing strategy.</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-[#FEE2E2] border border-[#DC2626]/20 rounded-xl text-sm text-[#DC2626]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            {error}
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => router.push("/projects")} className="px-6 py-2.5 text-sm font-semibold text-[#6C6C8A] border border-[#C8C8E0] rounded-xl hover:text-[#0F0E1A] hover:border-[#0F0E1A] transition-all">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!product.websiteUrl || !product.description || loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#6D28D9] text-white text-sm font-semibold rounded-xl hover:bg-[#5B21B6] hover:shadow-[0_6px_20px_rgba(109,40,217,.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing..." : "Analyze My Product"} →
          </button>
        </div>
      </form>
    </div>
  );
}
