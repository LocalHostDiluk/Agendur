import { LandingLanguageProvider } from "@/components/landing/LandingLanguageContext";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SocialProofMarquee } from "@/components/landing/SocialProofMarquee";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <LandingLanguageProvider>
      <main className="min-h-screen bg-paper text-ink selection:bg-grape selection:text-paper font-sans">
        {/* 1. NAV */}
        <Navbar />

        {/* 2. HERO (Fondo --ink) */}
        <HeroSection />

        {/* 3. CÓMO FUNCIONA (Fondo --paper, 1-2-3 con industrias) */}
        <HowItWorksSection />

        {/* 4. DIFERENCIADORES CLAVE (Bento asimétrico con esquinas no convencionales) */}
        <FeaturesSection />

        {/* 5. PRUEBA SOCIAL COMBINADA (Métricas + 3 Testimonios en tickets + Logos) */}
        <SocialProofMarquee />

        {/* 6. PRECIOS (Fondo --paper, 3 tickets con perforación punteada) */}
        <PricingSection />

        {/* 7. FAQ (Acordeón con marcador sello rotatorio) */}
        <FAQSection />

        {/* 8. CTA FINAL + FOOTER (Fondo --ink) */}
        <CTASection />
        <Footer />
      </main>
    </LandingLanguageProvider>
  );
}
