import { describe, expect, it, mock } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Mock de Sentry y motion para testing estático
mock.module("@sentry/nextjs", () => ({
  captureException: mock(),
}));

import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";

describe("ProcessingOverlay Component (Sección 3)", () => {
  describe("1. Estructura y Estilos", () => {
    it("renderiza la tarjeta con clase .ticket, .ticket-on-ink y ancho 320px", () => {
      const html = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="pago" lang="es" />
      );

      expect(html).toContain("ticket");
      expect(html).toContain("ticket-on-ink");
      expect(html).toContain("w-[320px]");
      expect(html).toContain("max-w-[320px]");
      expect(html).toContain("rounded-[var(--radius-lg,16px)]");
    });

    it("renderiza indicador de actividad con 3 cuadrados redondeados y gap 6px", () => {
      const html = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="pago" lang="es" />
      );

      expect(html).toContain('role="status"');
      expect(html).toContain('aria-label="Cargando"');
      expect(html).toContain("gap-[6px]");
      expect(html).toContain("agendur-pulse-dot-0");
      expect(html).toContain("agendur-pulse-dot-1");
      expect(html).toContain("agendur-pulse-dot-2");
    });

    it("renderiza el separador con clase .perforacion", () => {
      const html = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="pago" lang="es" />
      );

      expect(html).toContain("perforacion");
    });

    it("renderiza el texto de ayuda fijo en ES y EN", () => {
      const htmlEs = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="pago" lang="es" />
      );
      expect(htmlEs).toContain("Esto puede tardar unos segundos.");

      const htmlEn = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="pago" lang="en" />
      );
      expect(htmlEn).toContain("This may take a few seconds.");
    });
  });

  describe("2. Variantes de Contenedor", () => {
    it("variante modal (default) cubre con fondo rgba(29,23,32,0.85)", () => {
      const html = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} variant="modal" />
      );

      expect(html).toContain("bg-[rgba(29,23,32,0.85)]");
      expect(html).toContain("backdrop-blur-xs");
    });

    it("variante fullscreen cubre con fondo sólido --ink", () => {
      const html = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} variant="fullscreen" />
      );

      expect(html).toContain("bg-[var(--ink,#1d1720)]");
    });

    it("retorna null si isOpen es false", () => {
      const html = renderToStaticMarkup(
        <ProcessingOverlay isOpen={false} />
      );

      expect(html).toBe("");
    });
  });

  describe("3. Mensajes por Proceso", () => {
    it("proceso 'pago' muestra el primer mensaje en ES y EN", () => {
      const htmlEs = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="pago" lang="es" />
      );
      expect(htmlEs).toContain("Verificando datos de pago…");

      const htmlEn = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="pago" lang="en" />
      );
      expect(htmlEn).toContain("Verifying payment details…");
    });

    it("proceso 'reporte' muestra el primer mensaje en ES y EN", () => {
      const htmlEs = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="reporte" lang="es" />
      );
      expect(htmlEs).toContain("Recopilando datos…");

      const htmlEn = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="reporte" lang="en" />
      );
      expect(htmlEn).toContain("Gathering data…");
    });

    it("proceso 'reserva' muestra el primer mensaje en ES y EN", () => {
      const htmlEs = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="reserva" lang="es" />
      );
      expect(htmlEs).toContain("Verificando disponibilidad…");

      const htmlEn = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="reserva" lang="en" />
      );
      expect(htmlEn).toContain("Checking availability…");
    });
  });

  describe("4. Estados de Éxito y Error", () => {
    it("estado de éxito renderiza ícono CircleCheck y texto ¡Listo! / Done!", () => {
      const htmlEs = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} status="success" lang="es" />
      );
      expect(htmlEs).toContain("¡Listo!");
      expect(htmlEs).toContain("text-[var(--mint,#46b88a)]");

      const htmlEn = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} status="success" lang="en" />
      );
      expect(htmlEn).toContain("Done!");
    });

    it("estado de error renderiza ícono CircleAlert, mensaje de error y botón Reintentar", () => {
      const html = renderToStaticMarkup(
        <ProcessingOverlay
          isOpen={true}
          status="error"
          errorMessage="Error al conectar con la pasarela de pago"
          onRetry={() => {}}
          lang="es"
        />
      );

      expect(html).toContain("lucide-circle-alert");
      expect(html).toContain("text-[var(--danger,#d14343)]");
      expect(html).toContain("Error al conectar con la pasarela de pago");
      expect(html).toContain("Reintentar");
      expect(html).toContain("bg-[var(--grape,#6e49a6)]");
    });

    it("estado de error en inglés renderiza texto 'Retry'", () => {
      const htmlEn = renderToStaticMarkup(
        <ProcessingOverlay
          isOpen={true}
          status="error"
          onRetry={() => {}}
          lang="en"
        />
      );

      expect(htmlEn).toContain("Retry");
      expect(htmlEn).toContain("A problem occurred while processing the request.");
    });
  });
});
