import { describe, it, expect, mock } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Mock next/navigation for isolated test execution
mock.module("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: mock(),
    replace: mock(),
    prefetch: mock(),
    back: mock(),
    forward: mock(),
    refresh: mock(),
  }),
}));

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LandingLanguageProvider } from "@/components/landing/LandingLanguageContext";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { SocialProofMarquee } from "@/components/landing/SocialProofMarquee";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import LandingPage from "@/app/(landing)/page";

// Helper to wrap with ThemeProvider & LandingLanguageProvider
function renderWithTheme(component: React.ReactElement) {
  return renderToStaticMarkup(
    React.createElement(
      LandingLanguageProvider,
      null,
      React.createElement(ThemeProvider, null, component),
    ),
  );
}

describe("Landing Page Agendur - Sistema Risográfico y Ticket de Turno", () => {
  describe("1. Navbar Component", () => {
    it("renderiza navegación corporativa con logotipo Agendur y enlaces", () => {
      const html = renderWithTheme(React.createElement(Navbar));
      expect(html).toContain("Agendur");
      expect(html).toContain("Producto");
      expect(html).toContain("Precios");
      expect(html).toContain("Para tu negocio");
      expect(html).toContain("Contacto");
    });

    it("incluye selector de idioma ES/EN y enlace a iniciar sesión", () => {
      const html = renderWithTheme(React.createElement(Navbar));
      expect(html).toContain("ES");
      expect(html).toContain("EN");
      expect(html).toContain('href="/login"');
      expect(html).toContain("Iniciar sesión");
    });

    it("incluye botón CTA Reclama tus 14 días gratis con enlace a registro", () => {
      const html = renderWithTheme(React.createElement(Navbar));
      expect(html).toContain("Reclama tus 14 días gratis");
      expect(html).toContain('href="/register"');
    });
  });

  describe("2. HeroSection Component", () => {
    it("renderiza titular principal y subtítulo de la marca", () => {
      const html = renderWithTheme(React.createElement(HeroSection));
      expect(html).toContain("Deja de perseguir citas. Que te busquen a ti.");
      expect(html).toContain(
        "Agendur organiza tu negocio, tus sucursales y tus recordatorios",
      );
    });

    it("incluye llamada a la acción sin requerimiento de tarjeta", () => {
      const html = renderWithTheme(React.createElement(HeroSection));
      expect(html).toContain("Reclama tus 14 días gratis");
      expect(html).toContain("Sin tarjeta.");
      expect(html).toContain("Ve cómo funciona");
    });

    it("incluye ticket de turno interactivo con detalles de servicio", () => {
      const html = renderWithTheme(React.createElement(HeroSection));
      expect(html).toContain("Ticket de turno");
      expect(html).toContain("Corte &amp; Barba Master · Sucursal Centro");
      expect(html).toContain("Mateo Silva");
      expect(html).toContain("Confirmado");
    });
  });

  describe("3. HowItWorksSection Component", () => {
    it("renderiza los tres pasos con iconos de industrias", () => {
      const html = renderWithTheme(React.createElement(HowItWorksSection));
      expect(html).toContain("Cómo funciona");
      expect(html).toContain("Registra tu negocio");
      expect(html).toContain("Comparte tu link");
      expect(html).toContain("Agendur les recuerda por ti");
      expect(html).toContain("Clínica");
      expect(html).toContain("Barbería");
      expect(html).toContain("Spa");
    });
  });

  describe("4. FeaturesSection Component", () => {
    it("renderiza bento grid con portal público y diferenciadores clave", () => {
      const html = renderWithTheme(React.createElement(FeaturesSection));
      expect(html).toContain('id="diferenciadores"');
      expect(html).toContain("Tu negocio, tu link");
      expect(html).toContain("negocio.agendur.app");
      expect(html).toContain("Multi-sucursal, un solo panel");
      expect(html).toContain("WhatsApp/SMS que sí llegan");
      expect(html).toContain("Cobra un anticipo, no pierdas el lugar");
    });
  });

  describe("5. SocialProofMarquee Component", () => {
    it("renderiza métricas destacadas y testimonios", () => {
      const html = renderWithTheme(React.createElement(SocialProofMarquee));
      expect(html).toContain("+500");
      expect(html).toContain("negocios ya usan Agendur");
      expect(html).toContain("-30%");
      expect(html).toContain("12,000+");
      expect(html).toContain("Dr. Alejandro Ramos");
      expect(html).toContain("Mateo Silva");
      expect(html).toContain("Valeria Ríos");
      expect(html).toContain("Clínica San Lucas");
      expect(html).toContain("Barbería El Galgo");
    });
  });

  describe("6. PricingSection Component", () => {
    it("renderiza los 3 tickets de planes y el toggle de periodos simétrico", () => {
      const html = renderWithTheme(React.createElement(PricingSection));
      expect(html).toContain('id="precios"');
      expect(html).toContain("03 / Precios claros");
      expect(html).toContain("Un plan que sí te queda.");
      expect(html).toContain("Starter");
      expect(html).toContain("Pro");
      expect(html).toContain("Business");
      expect(html).toContain("Mensual");
      expect(html).toContain("Anual");
      expect(html).toContain("-20%");
      expect(html).toContain("price-toggle");
    });
  });

  describe("7. FAQSection Component", () => {
    it("renderiza acordeón accesible con preguntas frecuentes", () => {
      const html = renderWithTheme(React.createElement(FAQSection));
      expect(html).toContain('id="faq"');
      expect(html).toContain("Preguntas frecuentes");
      expect(html).toContain("¿Necesito tarjeta para probarlo?");
      expect(html).toContain(
        "¿Puedo tener varias sucursales con un solo plan?",
      );
      expect(html).toContain("¿Cómo llegan los recordatorios a mis clientes?");
    });
  });

  describe("8. CTASection y Footer Component", () => {
    it("renderiza el bloque de llamada a la acción final", () => {
      const html = renderWithTheme(React.createElement(CTASection));
      expect(html).toContain("¿Seguimos perdiendo citas o las ordenamos?");
      expect(html).toContain("Reclama tus 14 días gratis");
    });

    it("renderiza el footer con enlaces corporativos y selector de idioma", () => {
      const html = renderWithTheme(React.createElement(Footer));
      expect(html).toContain("Agendur");
      expect(html).toContain("Idioma:");
      expect(html).toContain("ES");
      expect(html).toContain("EN");
      expect(html).toContain("© 2026 Agendur Inc.");
    });
  });

  describe("9. LandingPage Complete Integration", () => {
    it("renderiza todas las secciones en el orden correcto", () => {
      const html = renderWithTheme(React.createElement(LandingPage));

      const posNav = html.indexOf("<header");
      const posHero = html.indexOf("Deja de perseguir citas");
      const posHow = html.indexOf("Cómo funciona");
      const posFeatures = html.indexOf('id="diferenciadores"');
      const posProof = html.indexOf(
        "Dueños de negocio que ya no persiguen clientes",
      );
      const posPricing = html.indexOf('id="precios"');
      const posFaq = html.indexOf('id="faq"');
      const posFooter = html.indexOf("<footer");

      expect(posNav).toBeGreaterThan(-1);
      expect(posHero).toBeGreaterThan(posNav);
      expect(posHow).toBeGreaterThan(posHero);
      expect(posFeatures).toBeGreaterThan(posHow);
      expect(posProof).toBeGreaterThan(posFeatures);
      expect(posPricing).toBeGreaterThan(posProof);
      expect(posFaq).toBeGreaterThan(posPricing);
      expect(posFooter).toBeGreaterThan(posFaq);
    });
  });
});
