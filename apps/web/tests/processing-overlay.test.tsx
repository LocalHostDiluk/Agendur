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

  describe("3. Mensajes por Proceso (§8.2 sin rotación artificial)", () => {
    it("proceso 'pago' muestra el mensaje canónico en ES y EN", () => {
      const htmlEs = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="pago" lang="es" />
      );
      expect(htmlEs).toContain("Procesando tu pago…");
      expect(htmlEs).not.toContain("Verificando datos de pago…");
      expect(htmlEs).not.toContain("Procesando con la pasarela…");

      const htmlEn = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="pago" lang="en" />
      );
      expect(htmlEn).toContain("Processing your payment…");
    });

    it("proceso 'reporte' muestra el mensaje canónico en ES y EN", () => {
      const htmlEs = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="reporte" lang="es" />
      );
      expect(htmlEs).toContain("Preparando tu reporte…");

      const htmlEn = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="reporte" lang="en" />
      );
      expect(htmlEn).toContain("Preparing your report…");
    });

    it("proceso 'reserva' muestra el mensaje canónico en ES y EN", () => {
      const htmlEs = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="reserva" lang="es" />
      );
      expect(htmlEs).toContain("Confirmando tu cita…");

      const htmlEn = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="reserva" lang="en" />
      );
      expect(htmlEn).toContain("Confirming your appointment…");
    });

    it("muestra progreso explícito del backend con stageMessage y respaldo customMessages[0]", () => {
      const htmlStage = renderToStaticMarkup(
        <ProcessingOverlay
          isOpen={true}
          process="pago"
          stageMessage="Validando cobro con Stripe…"
          customMessages={["Mensaje secundario"]}
        />
      );
      expect(htmlStage).toContain("Validando cobro con Stripe…");
      expect(htmlStage).not.toContain("Mensaje secundario");

      const htmlLegacy = renderToStaticMarkup(
        <ProcessingOverlay
          isOpen={true}
          process="pago"
          customMessages={["Primer mensaje backend", "Segundo mensaje ignorado"]}
        />
      );
      expect(htmlLegacy).toContain("Primer mensaje backend");
      expect(htmlLegacy).not.toContain("Segundo mensaje ignorado");
    });

    it("usa movimiento reducido opt-in en CSS y elimina demoras artificiales", () => {
      const html = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} process="pago" lang="es" />
      );
      expect(html).toContain("@media (prefers-reduced-motion: no-preference)");
      expect(html).not.toContain("@media (prefers-reduced-motion: reduce)");
    });
  });

  describe("4. Estados de Éxito y Error", () => {
    it("estado de éxito renderiza ícono CircleCheck con --success-text y texto ¡Listo! / Done!", () => {
      const htmlEs = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} status="success" lang="es" />
      );
      expect(htmlEs).toContain("¡Listo!");
      expect(htmlEs).toContain("text-[var(--success-text)]");

      const htmlEn = renderToStaticMarkup(
        <ProcessingOverlay isOpen={true} status="success" lang="en" />
      );
      expect(htmlEn).toContain("Done!");
    });

    it("estado de error renderiza ícono CircleAlert con --danger-text, mensaje y botón Reintentar con --action-bg", () => {
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
      expect(html).toContain("text-[var(--danger-text)]");
      expect(html).toContain("Error al conectar con la pasarela de pago");
      expect(html).toContain("Reintentar");
      expect(html).toContain("bg-[var(--action-bg)]");
      expect(html).toContain("text-[var(--action-fg)]");
      expect(html).toContain("focus-visible:outline-grape");
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
