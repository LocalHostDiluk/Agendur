import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProofMarquee } from "@/components/landing/SocialProofMarquee";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ImpactChartSection } from "@/components/landing/ImpactChartSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 selection:bg-blue-600 selection:text-white transition-colors duration-200">
      <Navbar />
      <HeroSection />
      <SocialProofMarquee />
      <FeaturesSection />
      <ImpactChartSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
