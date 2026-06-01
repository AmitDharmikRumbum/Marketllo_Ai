import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { LogosMarquee } from "@/components/landing/LogosMarquee";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Stats } from "@/components/landing/Stats";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F6FF]">
      <Navbar />
      <Hero />
      <LogosMarquee />
      <HowItWorks />
      <Stats />
      <Pricing />
      <Footer />
    </div>
  );
}
