import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ProductAnalysis {
  productName: string;
  category: string;
  categoryMatch: number;
  otherCategories: string[];
  tagline: string;
  audience: {
    title: string;
    description: string;
    companySize: string;
    roles: string;
    industry: string;
    location: string;
  };
  platforms: { name: string; platform: string; score: number; reason: string }[];
  contentStyle: {
    name: string;
    description: string;
    tags: string[];
    pillars: string[];
  };
  postIdeas: string[];
}

export interface OnboardingState {
  step: number;
  product: {
    websiteUrl: string;
    appstoreUrl: string;
    playstoreUrl: string;
    description: string;
  };
  productId: string | null;
  analysisId: string | null;
  analysis: ProductAnalysis | null;
  selectedPlatforms: string[];
  connectedAccounts: string[];
  strategy: {
    postsPerWeek: number;
    contentMix: { posts: number; reels: number; carousels: number };
    voiceStyle: string;
  };
  setStep: (step: number) => void;
  setProduct: (product: Partial<OnboardingState["product"]>) => void;
  setProductId: (id: string | null) => void;
  setAnalysisId: (id: string | null) => void;
  setAnalysis: (analysis: ProductAnalysis | null) => void;
  togglePlatform: (platform: string) => void;
  connectAccount: (platform: string) => void;
  setStrategy: (strategy: Partial<OnboardingState["strategy"]>) => void;
  reset: () => void;
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      product: { websiteUrl: "", appstoreUrl: "", playstoreUrl: "", description: "" },
      productId: null,
      analysisId: null,
      analysis: null,
      selectedPlatforms: ["instagram", "linkedin"],
      connectedAccounts: [],
      strategy: { postsPerWeek: 6, contentMix: { posts: 3, reels: 2, carousels: 1 }, voiceStyle: "professional" },

      setStep: (step) => set({ step }),
      setProduct: (product) => set((s) => ({ product: { ...s.product, ...product } })),
      setProductId: (productId) => set({ productId }),
      setAnalysisId: (analysisId) => set({ analysisId }),
      setAnalysis: (analysis) => set({ analysis }),
      togglePlatform: (platform) =>
        set((s) => ({
          selectedPlatforms: s.selectedPlatforms.includes(platform)
            ? s.selectedPlatforms.filter((p) => p !== platform)
            : [...s.selectedPlatforms, platform],
        })),
      connectAccount: (platform) =>
        set((s) => ({
          connectedAccounts: s.connectedAccounts.includes(platform)
            ? s.connectedAccounts
            : [...s.connectedAccounts, platform],
        })),
      setStrategy: (strategy) =>
        set((s) => ({ strategy: { ...s.strategy, ...strategy } })),
      reset: () =>
        set({
          step: 1,
          product: { websiteUrl: "", appstoreUrl: "", playstoreUrl: "", description: "" },
          productId: null,
          analysisId: null,
          analysis: null,
          selectedPlatforms: ["instagram", "linkedin"],
          connectedAccounts: [],
          strategy: { postsPerWeek: 6, contentMix: { posts: 3, reels: 2, carousels: 1 }, voiceStyle: "professional" },
        }),
    }),
    { name: "marketify-onboarding" }
  )
);
