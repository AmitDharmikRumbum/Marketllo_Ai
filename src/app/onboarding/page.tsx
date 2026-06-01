"use client";

import { useOnboarding } from "@/store/onboarding";
import { OnboardingSidebar } from "@/components/onboarding/OnboardingSidebar";
import { Step1Product } from "@/components/onboarding/Step1Product";
import { Step2Analysis } from "@/components/onboarding/Step2Analysis";
import { Step3Platforms } from "@/components/onboarding/Step3Platforms";
import { Step4Connect } from "@/components/onboarding/Step4Connect";
import { Step5Strategy } from "@/components/onboarding/Step5Strategy";

export default function OnboardingPage() {
  const { step } = useOnboarding();

  const panels: Record<number, React.ReactNode> = {
    1: <Step1Product />,
    2: <Step2Analysis />,
    3: <Step3Platforms />,
    4: <Step4Connect />,
    5: <Step5Strategy />,
  };

  return (
    <div className="min-h-screen bg-[#F7F6FF] flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] flex bg-white rounded-3xl shadow-[0_8px_40px_rgba(80,40,160,.1)] overflow-hidden" style={{ minHeight: 680 }}>
        <OnboardingSidebar />
        <main className="flex-1 overflow-auto">
          <div key={step} className="animate-pan-in h-full">
            {panels[step]}
          </div>
        </main>
      </div>
    </div>
  );
}
