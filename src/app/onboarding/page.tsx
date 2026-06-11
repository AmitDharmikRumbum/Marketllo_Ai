"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useOnboarding } from "@/store/onboarding";
import { OnboardingSidebar } from "@/components/onboarding/OnboardingSidebar";
import { Step1Product } from "@/components/onboarding/Step1Product";
import { Step2Analysis } from "@/components/onboarding/Step2Analysis";
import { Step3Platforms } from "@/components/onboarding/Step3Platforms";
import { Step4Connect } from "@/components/onboarding/Step4Connect";
import { Step5Strategy } from "@/components/onboarding/Step5Strategy";

function OnboardingContent() {
  const { step, reset } = useOnboarding();
  const searchParams = useSearchParams();
  const isResume = searchParams.get("resume") === "1";

  useEffect(() => {
    if (!isResume) reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const panels: Record<number, React.ReactNode> = {
    1: <Step1Product />,
    2: <Step2Analysis />,
    3: <Step3Platforms />,
    4: <Step4Connect />,
    5: <Step5Strategy />,
  };

  return (
    <main className="flex-1 overflow-auto">
      <div key={step} className="animate-pan-in h-full">
        {panels[step]}
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#F7F6FF] flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] flex bg-white rounded-3xl shadow-[0_8px_40px_rgba(80,40,160,.1)] overflow-hidden" style={{ minHeight: 680 }}>
        <OnboardingSidebar />
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#6D28D9] border-t-transparent rounded-full animate-spin" /></div>}>
          <OnboardingContent />
        </Suspense>
      </div>
    </div>
  );
}
