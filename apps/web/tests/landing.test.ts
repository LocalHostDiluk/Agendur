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
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProofMarquee } from "@/components/landing/SocialProofMarquee";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ImpactChartSection } from "@/components/landing/ImpactChartSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { Footer } from "@/components/landing/Footer";
import LandingPage from "@/app/(landing)/page";

// Helper to wrap with ThemeProvider
function renderWithTheme(component: React.ReactElement) {
  return renderToStaticMarkup(
    React.createElement(ThemeProvider, null, component),
  );
}

describe("Landing Page Preline UI v5 - Rediseño Integral (Tarea 1.5.5)", () => {
  describe("1. Navbar Component (Floating Navbar with CTA)", () => {
    it("renderiza floating pill header con pseudo-elemento before y clases de Preline", () => {
      const html = renderWithTheme(React.createElement(Navbar));
      expect(html).toContain("sticky top-4");
      expect(html).toContain("before:max-w-5xl");
      expect(html).toContain("before:rounded-[26px]");
      expect(html).toContain("before:bg-navbar");
      expect(html).toContain("before:border-navbar-line");
    });

    it("incluye logotipo Preline SVG y enlaces principales de Agendur con dropdowns", () => {
      const html = renderWithTheme(React.createElement(Navbar));
      expect(html).toContain('aria-label="Preline"');
      expect(html).toContain("fill-primary");
      expect(html).toContain("Inicio");
      expect(html).toContain("Características");
      expect(html).toContain("Impacto");
      expect(html).toContain("Precios");
      expect(html).toContain("FAQ");
      expect(html).toContain("Funcionalidades Clave");
      expect(html).toContain("Agenda en Tiempo Real");
      expect(html).toContain("Cobro de Anticipos");
      expect(html).toContain("Recordatorios WhatsApp");
      expect(html).toContain("Control Multi-Sucursal");
      expect(html).toContain("Sincronización Google Calendar");
      expect(html).not.toContain("Gestión Operativa");
    });

    it("incluye botón CTA Comenzar Gratis, Iniciar Sesión y toggle de menú colapsable Preline", () => {
      const html = renderWithTheme(React.createElement(Navbar));
      expect(html).toContain("Comenzar Gratis");
      expect(html).toContain('href="/register"');
      expect(html).toContain("Iniciar Sesión");
      expect(html).toContain("bg-primary");
      expect(html).toContain("text-primary-foreground");
      expect(html).toContain("hs-collapse-toggle");
      expect(html).toContain('data-hs-collapse="#hs-pro-an"');
      expect(html).toContain('id="hs-pro-an"');
    });
  });

  describe("2. HeroSection Component", () => {
    it("renderiza píldora badge, titular audaz y subtítulo orientado a beneficios", () => {
      const html = renderWithTheme(React.createElement(HeroSection));
      expect(html).toContain(
        "Nueva versión: Anticipos y recordatorios inteligentes",
      );
      expect(html).toContain("El software de citas que");
      expect(html).toContain("elimina el ausentismo");
      expect(html).toContain("llena tu agenda en piloto automático");
      expect(html).toContain(
        "Permite a tus clientes agendar en menos de 30 segundos",
      );
    });

    it("incluye input de micro-captura de slug y garantía de 14 días sin sección de calificación", () => {
      const html = renderWithTheme(React.createElement(HeroSection));
      expect(html).toContain("agendur.com/");
      expect(html).toContain("tu-marca");
      expect(html).toContain("Comenzar Gratis");
      expect(html).toContain("Prueba de 14 días sin tarjeta de crédito");
      expect(html).not.toContain("4.9/5");
    });

    it("incluye tarjeta interactiva con servicios, profesional y anticipo", () => {
      const html = renderWithTheme(React.createElement(HeroSection));
      expect(html).toContain("agendur.com/reserva/live");
      expect(html).toContain("Corte &amp; Barba Master");
      expect(html).toContain("Anticipo Requerido (50%)");
      expect(html).toContain("Simular Confirmación de Cita");
    });
  });

  describe("3. SocialProofMarquee Component", () => {
    it("renderiza ticker accesible con sectores e indicadores de confianza", () => {
      const html = renderWithTheme(React.createElement(SocialProofMarquee));
      expect(html).toContain("Barberías");
      expect(html).toContain("Salones de Belleza");
      expect(html).toContain("Spas &amp; Masajes");
      expect(html).toContain("Clínicas Dentales");
      expect(html).toContain("Consultorios Médicos");
      expect(html).toContain("99.9% Uptime");
      expect(html).toContain("Sin comisiones por cita");
      expect(html).toContain("Pasarela Stripe y Cobro Manual");
    });

    it("incluye clases de animación marquee con respeto a prefers-reduced-motion", () => {
      const html = renderWithTheme(React.createElement(SocialProofMarquee));
      expect(html).toContain("animate-marquee");
      expect(html).toContain("motion-reduce:animate-none");
      expect(html).toContain("hover:[animation-play-state:paused]");
    });
  });

  describe("4. FeaturesSection Component", () => {
    it("renderiza Bento Grid asimétrico con 4 cuadrantes creativos", () => {
      const html = renderWithTheme(React.createElement(FeaturesSection));
      expect(html).toContain('id="caracteristicas"');
      // Cuadrante 1 (span 2 cols)
      expect(html).toContain(
        "Agenda y Disponibilidad Multi-Sucursal en Tiempo Real",
      );
      expect(html).toContain("Sucursal Polanco");
      // Cuadrante 2
      expect(html).toContain("Cobro de Anticipos y Pagos Online");
      expect(html).toContain("-85% Ausencias");
      // Cuadrante 3
      expect(html).toContain("Recordatorios por WhatsApp y Email");
      // Cuadrante 4 (span 2 cols)
      expect(html).toContain("Portal de Autoservicio para Clientes Móviles");
      expect(html).toContain("/reserva/[slug]");
    });
  });

  describe("5. ImpactChartSection Component", () => {
    it("renderiza gráfica interactiva de impacto y selector de sectores", () => {
      const html = renderWithTheme(React.createElement(ImpactChartSection));
      expect(html).toContain('id="impacto"');
      expect(html).toContain(
        "¿Por qué elegir Agendur frente a la gestión manual?",
      );
      expect(html).toContain("Belleza &amp; Barbería");
      expect(html).toContain("Salud &amp; Clínicas");
      expect(html).toContain("Bienestar &amp; Spas");
    });

    it("incluye comparativas visuales y tarjeta de retorno de inversión (ROI)", () => {
      const html = renderWithTheme(React.createElement(ImpactChartSection));
      expect(html).toContain("-85% ausentismo");
      expect(html).toContain("+17.5 hrs ahorradas");
      expect(html).toContain("38% agendadas de noche");
      expect(html).toContain("Retorno de Inversión (ROI)");
      expect(html).toContain("$1,250 USD");
    });
  });

  describe("6. PricingSection Component", () => {
    it("renderiza los 3 planes de Preline UI y el switcher mensual/anual", () => {
      const html = renderWithTheme(React.createElement(PricingSection));
      expect(html).toContain('id="precios"');
      expect(html).toContain("Emprendedor");
      expect(html).toContain("PYME Crecimiento");
      expect(html).toContain("Multi-Sucursal Enterprise");
      expect(html).toContain("Más Popular");
      expect(html).toContain("Ahorra 20%");
      expect(html).toContain('role="switch"');
      expect(html).toContain('href="/register?plan=emprendedor"');
      expect(html).toContain('href="/register?plan=pyme"');
    });
  });

  describe("7. FAQSection Component", () => {
    it("renderiza acordeón accesible con preguntas frecuentes y atributos WAI-ARIA", () => {
      const html = renderWithTheme(React.createElement(FAQSection));
      expect(html).toContain('id="faq"');
      expect(html).toContain("max-w-340");
      expect(html).toContain("hs-accordion-group");
      expect(html).toContain("hs-accordion-toggle");
      expect(html).toContain("Preguntas Frecuentes");
      expect(html).toContain(
        "Resolvemos tus dudas principales para que des el paso hacia la automatización de tu agenda.",
      );
      expect(html).toContain(
        "¿Se requiere tarjeta de crédito para iniciar la prueba de 14 días?",
      );
      expect(html).toContain(
        "¿Cómo funciona el portal de reservas para mis clientes?",
      );
      expect(html).toContain(
        "¿Puedo administrar múltiples sucursales con personal y horarios diferentes?",
      );
      expect(html).toContain(
        "¿Cómo se manejan los anticipos y qué pasarelas de pago se admiten?",
      );
      expect(html).toContain(
        "¿Cómo funcionan los recordatorios automáticos por WhatsApp?",
      );
      expect(html).toContain(
        "¿Puedo sincronizar mi agenda con Google Calendar?",
      );
      expect(html).toContain('aria-expanded="true"');
      expect(html).toContain('role="region"');
      expect(html).toContain("hs-accordion-active:hidden");
      expect(html).toContain("hs-accordion-active:block");
    });
  });

  describe("8. Footer Component", () => {
    it("renderiza layout corporativo con enlaces, ThemeToggle y copyright dinámico", () => {
      const html = renderWithTheme(React.createElement(Footer));
      const year = new Date().getFullYear().toString();
      expect(html).toContain("Agendur");
      expect(html).toContain(year);
      expect(html).toContain('href="#caracteristicas"');
      expect(html).toContain('href="#precios"');
      expect(html).toContain("Alternar tema");
    });
  });

  describe("9. LandingPage Complete Integration", () => {
    it("renderiza todas las secciones en orden con soporte a modo claro y oscuro sin CTA final", () => {
      const html = renderWithTheme(React.createElement(LandingPage));
      expect(html).toContain("bg-white");
      expect(html).toContain("dark:bg-neutral-950");
      expect(html).toContain("text-gray-900");
      expect(html).toContain("dark:text-neutral-100");
      expect(html).toContain("hs-dark-mode");

      // Verify sections appear in expected sequence (FAQ directly to Footer)
      const posNav = html.indexOf("<header");
      const posHero = html.indexOf("agendur.com/");
      const posMarquee = html.indexOf("animate-marquee");
      const posFeatures = html.indexOf('id="caracteristicas"');
      const posImpact = html.indexOf('id="impacto"');
      const posPricing = html.indexOf('id="precios"');
      const posFaq = html.indexOf('id="faq"');
      const posFooter = html.indexOf("<footer");

      expect(posNav).toBeGreaterThan(-1);
      expect(posHero).toBeGreaterThan(posNav);
      expect(posMarquee).toBeGreaterThan(posHero);
      expect(posFeatures).toBeGreaterThan(posMarquee);
      expect(posImpact).toBeGreaterThan(posFeatures);
      expect(posPricing).toBeGreaterThan(posImpact);
      expect(posFaq).toBeGreaterThan(posPricing);
      expect(posFooter).toBeGreaterThan(posFaq);

      // Verify CTASection is completely removed
      expect(html).not.toContain(
        "¿Listo para digitalizar la agenda de tus sucursales?",
      );
    });
  });
});
