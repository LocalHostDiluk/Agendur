import { describe, it, expect } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  PendingBadge,
} from "@/components/ui";

describe("Dashboard Visual Alignment & Design Tokens — Agendur UI (docs/diseño/Design-system.md)", () => {
  describe("Button Component (§5.13 & §4.4)", () => {
    it("renderiza botón primario con token bg-grape, texto blanco, radio md y sin clases obsoletas", () => {
      const html = renderToStaticMarkup(
        React.createElement(Button, { variant: "primary" }, "Guardar Cita")
      );

      // Tokens oficiales
      expect(html).toContain("bg-grape");
      expect(html).toContain("text-white");
      expect(html).toContain("rounded-[var(--radius-md)]");
      expect(html).toContain("active:scale-[0.98]");
      expect(html).toContain("duration-100");
      expect(html).toContain("Guardar Cita");

      // Verificación de ausencia de colores o radios obsoletos de Preline default
      expect(html).not.toContain("bg-blue-600");
      expect(html).not.toContain("hover:bg-blue-700");
      expect(html).not.toContain("rounded-lg");
    });

    it("renderiza variante por defecto como primary y altura de 40px (h-10)", () => {
      const html = renderToStaticMarkup(
        React.createElement(Button, null, "Acción Principal")
      );

      expect(html).toContain("bg-grape");
      expect(html).toContain("h-10 px-4 text-sm");
      expect(html).toContain("rounded-[var(--radius-md)]");
    });

    it("renderiza variante secondary con bg-surface, borde border y texto text-primary", () => {
      const html = renderToStaticMarkup(
        React.createElement(Button, { variant: "secondary" }, "Cancelar")
      );

      expect(html).toContain("bg-surface");
      expect(html).toContain("border border-border");
      expect(html).toContain("text-text-primary");
      expect(html).toContain("hover:bg-surface-alt");
      expect(html).toContain("active:scale-[0.98]");
      expect(html).not.toContain("bg-gray-100");
      expect(html).not.toContain("dark:bg-neutral-700");
    });

    it("renderiza variantes destructivas (danger y destructive) con token bg-danger sólido", () => {
      const dangerHtml = renderToStaticMarkup(
        React.createElement(Button, { variant: "danger" }, "Eliminar")
      );
      expect(dangerHtml).toContain("bg-danger");
      expect(dangerHtml).toContain("text-white");
      expect(dangerHtml).toContain("rounded-[var(--radius-md)]");
      expect(dangerHtml).not.toContain("bg-red-500");

      const destructiveHtml = renderToStaticMarkup(
        React.createElement(Button, { variant: "destructive" }, "Eliminar Sucursal")
      );
      expect(destructiveHtml).toContain("bg-danger");
      expect(destructiveHtml).toContain("text-white");
      expect(destructiveHtml).toContain("rounded-[var(--radius-md)]");
      expect(destructiveHtml).not.toContain("bg-red-500");
    });

    it("renderiza variante ghost con fondo transparente y hover en surface-alt", () => {
      const html = renderToStaticMarkup(
        React.createElement(Button, { variant: "ghost" }, "Opciones")
      );

      expect(html).toContain("bg-transparent");
      expect(html).toContain("text-text-secondary");
      expect(html).toContain("hover:bg-surface-alt");
    });

    it("respeta alturas especificadas en §5.13: 32px para small (h-8) y 40px para medium (h-10)", () => {
      const sm = renderToStaticMarkup(
        React.createElement(Button, { size: "sm" }, "Small")
      );
      expect(sm).toContain("h-8 px-3 text-xs");

      const md = renderToStaticMarkup(
        React.createElement(Button, { size: "md" }, "Medium")
      );
      expect(md).toContain("h-10 px-4 text-sm");

      const lg = renderToStaticMarkup(
        React.createElement(Button, { size: "lg" }, "Large")
      );
      expect(lg).toContain("h-12 px-5 text-base");
    });

    it("renderiza estado de carga accesible con aria-busy y spinner de carga", () => {
      const html = renderToStaticMarkup(
        React.createElement(Button, { isLoading: true }, "Guardando...")
      );

      expect(html).toContain('aria-busy="true"');
      expect(html).toContain("disabled");
      expect(html).toContain('role="status"');
      expect(html).toContain("animate-spin");
    });
  });

  describe("Badge Component (§5.12)", () => {
    it("renderiza variantes semánticas con fondos suaves y bordes de acento", () => {
      // Success (Confirmada / Pagado)
      const successHtml = renderToStaticMarkup(
        React.createElement(Badge, { variant: "success" }, "Confirmada")
      );
      expect(successHtml).toContain("text-success");
      expect(successHtml).toContain("bg-success-soft");
      expect(successHtml).toContain("border-success/20");
      expect(successHtml).not.toContain("bg-teal-100");

      // Warning (Pendiente)
      const warningHtml = renderToStaticMarkup(
        React.createElement(Badge, { variant: "warning" }, "Pendiente")
      );
      expect(warningHtml).toContain("text-warning");
      expect(warningHtml).toContain("bg-warning-soft");
      expect(warningHtml).toContain("border-warning/20");
      expect(warningHtml).not.toContain("bg-amber-100");

      // Danger (Cancelada)
      const dangerHtml = renderToStaticMarkup(
        React.createElement(Badge, { variant: "danger" }, "Cancelada")
      );
      expect(dangerHtml).toContain("text-danger");
      expect(dangerHtml).toContain("bg-danger-soft");
      expect(dangerHtml).toContain("border-danger/20");
      expect(dangerHtml).not.toContain("bg-red-100");

      // Grape / Info (Completada)
      const grapeHtml = renderToStaticMarkup(
        React.createElement(Badge, { variant: "grape" }, "Completada")
      );
      expect(grapeHtml).toContain("text-grape");
      expect(grapeHtml).toContain("bg-grape-soft");
      expect(grapeHtml).toContain("border-grape/20");
      expect(grapeHtml).not.toContain("bg-blue-100");

      // Neutral
      const neutralHtml = renderToStaticMarkup(
        React.createElement(Badge, { variant: "neutral" }, "Borrador")
      );
      expect(neutralHtml).toContain("text-text-secondary");
      expect(neutralHtml).toContain("bg-surface-alt");
      expect(neutralHtml).toContain("border-border");
      expect(neutralHtml).not.toContain("bg-gray-100");
    });

    it("renderiza punto semántico cuando dot está activo (por defecto y explícito)", () => {
      const htmlDefault = renderToStaticMarkup(
        React.createElement(Badge, { variant: "success" }, "Activo")
      );
      // Incluye punto con color correspondiente y aria-hidden
      expect(htmlDefault).toContain("w-1.5 h-1.5 rounded-full shrink-0 bg-success");
      expect(htmlDefault).toContain('aria-hidden="true"');
      expect(htmlDefault).toContain("Activo");

      const htmlWarning = renderToStaticMarkup(
        React.createElement(Badge, { variant: "warning", dot: true }, "Por Confirmar")
      );
      expect(htmlWarning).toContain("bg-warning");

      const htmlDanger = renderToStaticMarkup(
        React.createElement(Badge, { variant: "danger", dot: true }, "No Asistió")
      );
      expect(htmlDanger).toContain("bg-danger");

      const htmlGrape = renderToStaticMarkup(
        React.createElement(Badge, { variant: "grape", dot: true }, "Finalizada")
      );
      expect(htmlGrape).toContain("bg-grape");
    });

    it("no renderiza punto semántico cuando dot={false}", () => {
      const html = renderToStaticMarkup(
        React.createElement(Badge, { variant: "success", dot: false }, "Sin Punto")
      );

      expect(html).not.toContain("w-1.5 h-1.5");
      expect(html).toContain("Sin Punto");
    });

    it("aplica bordes redondeados completos (rounded-full) y fusiona clases adicionales", () => {
      const html = renderToStaticMarkup(
        React.createElement(Badge, { className: "custom-badge-class" }, "Prueba")
      );

      expect(html).toContain("rounded-full");
      expect(html).toContain("custom-badge-class");
    });
  });

  describe("Card Component y Subcomponentes (§5.4)", () => {
    it("renderiza Card con tokens bg-surface, border-border y rounded-[var(--radius-md)]", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          Card,
          { className: "kpi-card" },
          React.createElement(
            CardHeader,
            null,
            React.createElement(CardTitle, null, "Citas de hoy"),
            React.createElement(CardDescription, null, "Resumen diario de reservaciones")
          ),
          React.createElement(CardContent, null, "34 citas confirmadas"),
          React.createElement(CardFooter, null, "Ver detalles")
        )
      );

      // Card contenedor
      expect(html).toContain("bg-surface");
      expect(html).toContain("border border-border");
      expect(html).toContain("rounded-[var(--radius-md)]");
      expect(html).toContain("shadow-xs");
      expect(html).toContain("kpi-card");

      // Ausencia de clases sin token
      expect(html).not.toContain("bg-white");
      expect(html).not.toContain("border-gray-200");
      expect(html).not.toContain("rounded-xl");
      expect(html).not.toContain("dark:bg-neutral-900");

      // Header y Footer divisores
      expect(html).toContain("border-b border-border");
      expect(html).toContain("border-t border-border");

      // Title & Description con tokens semánticos de tipografía
      expect(html).toContain("text-text-primary");
      expect(html).toContain("font-semibold");
      expect(html).toContain("text-text-secondary");
      expect(html).toContain("Citas de hoy");
      expect(html).toContain("Resumen diario de reservaciones");
      expect(html).toContain("34 citas confirmadas");
    });
  });

  describe("Table Component (§5.5)", () => {
    it("renderiza encabezados con bg-surface-alt, borde inferior y sticky", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          Table,
          null,
          React.createElement(
            TableHeader,
            null,
            React.createElement(
              TableRow,
              null,
              React.createElement(TableHead, null, "Cliente"),
              React.createElement(TableHead, null, "Servicio"),
              React.createElement(TableHead, null, "Estado")
            )
          )
        )
      );

      expect(html).toContain("bg-surface-alt");
      expect(html).toContain("border-b border-border");
      expect(html).toContain("sticky top-0");
    });

    it("renderiza TableHead sin clase uppercase forzada, usando texto en text-secondary", () => {
      const html = renderToStaticMarkup(
        React.createElement(TableHead, null, "Fecha de reserva")
      );

      // Sentencia obligatoria §3: sentence case, sin uppercase sostenido forzado
      expect(html).not.toContain("uppercase");
      expect(html).toContain("text-text-secondary");
      expect(html).toContain("text-xs font-medium");
      expect(html).toContain("Fecha de reserva");
    });

    it("renderiza TableRow con altura balanceada h-12 (48px) y hover bg-surface-alt", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          TableRow,
          null,
          React.createElement(TableCell, null, "Dr. Roberto Silva")
        )
      );

      // Fila 48px según §5.5
      expect(html).toContain("h-12");
      expect(html).toContain("hover:bg-surface-alt");
      expect(html).toContain("transition-colors");
    });

    it("renderiza TableCell con color de texto primario y división sutil", () => {
      const html = renderToStaticMarkup(
        React.createElement(TableCell, null, "Corte clásico")
      );

      expect(html).toContain("text-text-primary");
      expect(html).toContain("border-b border-border/50");
      expect(html).toContain("Corte clásico");
    });
  });

  describe("PendingBadge Component (Marcador de Pendientes/Mocks UI)", () => {
    it("renderiza con texto por defecto 'Pendiente' y tooltip explicativo", () => {
      const html = renderToStaticMarkup(React.createElement(PendingBadge));

      expect(html).toContain("Pendiente");
      expect(html).toContain('title="Lógica pendiente de integración en backend"');
      expect(html).toContain("bg-amber-500/10");
      expect(html).toContain("border border-dashed border-amber-500/30");
      expect(html).toContain("font-mono text-[10px]");
      expect(html).toContain("cursor-help");
      expect(html).toContain("rounded-full");
    });

    it("renderiza punto pulsante ámbar para captar atención visual sin ser disruptivo", () => {
      const html = renderToStaticMarkup(React.createElement(PendingBadge));

      expect(html).toContain("w-1 h-1 rounded-full bg-amber-500 animate-pulse");
      expect(html).toContain('aria-hidden="true"');
    });

    it("soporta texto personalizado, tooltip personalizado y clases custom", () => {
      const html = renderToStaticMarkup(
        React.createElement(PendingBadge, {
          label: "Próximamente en v2",
          tooltip: "Módulo en cola para la siguiente versión",
          className: "ml-3 custom-align",
        })
      );

      expect(html).toContain("Próximamente en v2");
      expect(html).toContain('title="Módulo en cola para la siguiente versión"');
      expect(html).toContain("custom-align");
      expect(html).toContain("ml-3");
    });
  });
});
