import { describe, it, expect } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  PendingBadge,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  ProcessingOverlay,
} from "@/components/ui";

describe("UI Kit Base - Agendur Design System Primitives", () => {
  describe("Button Component (§5.13)", () => {
    it("renderiza botón con variante por defecto (primary) y tamaño md (40px de alto, radius-md)", () => {
      const html = renderToStaticMarkup(
        React.createElement(Button, null, "Guardar")
      );
      expect(html).toContain("Guardar");
      expect(html).toContain("bg-grape");
      expect(html).toContain("text-white");
      expect(html).toContain("h-10 px-4 text-sm");
      expect(html).toContain("rounded-[var(--radius-md)]");
      expect(html).toContain("active:scale-[0.98]");
      expect(html).toContain("duration-100");
    });

    it("soporta todas las variantes del sistema de diseño (§5.13)", () => {
      const primary = renderToStaticMarkup(
        React.createElement(Button, { variant: "primary" }, "Primary")
      );
      expect(primary).toContain("bg-grape");
      expect(primary).toContain("text-white");

      const secondary = renderToStaticMarkup(
        React.createElement(Button, { variant: "secondary" }, "Secondary")
      );
      expect(secondary).toContain("bg-surface");
      expect(secondary).toContain("border-border");
      expect(secondary).toContain("text-text-primary");
      expect(secondary).toContain("hover:bg-surface-alt");

      const outline = renderToStaticMarkup(
        React.createElement(Button, { variant: "outline" }, "Outline")
      );
      expect(outline).toContain("border-border");
      expect(outline).toContain("text-text-primary");
      expect(outline).toContain("hover:bg-surface-alt");

      const ghost = renderToStaticMarkup(
        React.createElement(Button, { variant: "ghost" }, "Ghost")
      );
      expect(ghost).toContain("text-text-secondary");
      expect(ghost).toContain("hover:bg-surface-alt");
      expect(ghost).toContain("hover:text-text-primary");

      const danger = renderToStaticMarkup(
        React.createElement(Button, { variant: "danger" }, "Danger")
      );
      expect(danger).toContain("bg-danger");
      expect(danger).toContain("text-white");

      const destructive = renderToStaticMarkup(
        React.createElement(Button, { variant: "destructive" }, "Destructive")
      );
      expect(destructive).toContain("bg-danger");
      expect(destructive).toContain("text-white");
    });

    it("soporta todos los tamaños (sm 32px, md 40px, lg 48px)", () => {
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

    it("renderiza spinner de carga cuando isLoading=true y deshabilita el botón", () => {
      const html = renderToStaticMarkup(
        React.createElement(Button, { isLoading: true }, "Procesando")
      );
      expect(html).toContain("disabled");
      expect(html).toContain('aria-busy="true"');
      expect(html).toContain("animate-spin");
      expect(html).toContain('role="status"');
      expect(html).toContain("Procesando");
    });

    it("respeta atributo disabled nativo y combina custom className", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          Button,
          { disabled: true, className: "w-full custom-shadow" },
          "Bloqueado"
        )
      );
      expect(html).toContain("disabled");
      expect(html).toContain("disabled:opacity-50");
      expect(html).toContain("w-full custom-shadow");
    });
  });

  describe("Card Component y Subcomponentes (§5.4)", () => {
    it("renderiza Card completa con tokens del sistema de diseño", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          Card,
          { className: "custom-card" },
          React.createElement(
            CardHeader,
            { className: "custom-header" },
            React.createElement(CardTitle, null, "Detalle del Negocio"),
            React.createElement(CardDescription, null, "Gestiona tu información")
          ),
          React.createElement(CardContent, { className: "custom-content" }, "Contenido de prueba"),
          React.createElement(CardFooter, { className: "custom-footer" }, "Pie de tarjeta")
        )
      );

      // Card container con tokens
      expect(html).toContain("bg-surface");
      expect(html).toContain("border-border");
      expect(html).toContain("rounded-[var(--radius-md)]");
      expect(html).toContain("shadow-xs");
      expect(html).toContain("transition-colors");
      expect(html).toContain("custom-card");

      // CardHeader con borde token
      expect(html).toContain("border-b");
      expect(html).toContain("border-border");
      expect(html).toContain("custom-header");

      // CardTitle & Description con tipografía y color de tokens
      expect(html).toContain("<h3");
      expect(html).toContain("text-text-primary");
      expect(html).toContain("font-semibold");
      expect(html).toContain("text-base");
      expect(html).toContain("Detalle del Negocio");
      expect(html).toContain("<p");
      expect(html).toContain("text-text-secondary");
      expect(html).toContain("text-sm");
      expect(html).toContain("Gestiona tu información");

      // CardContent & Footer
      expect(html).toContain("Contenido de prueba");
      expect(html).toContain("custom-content");
      expect(html).toContain("border-t");
      expect(html).toContain("border-border");
      expect(html).toContain("Pie de tarjeta");
      expect(html).toContain("custom-footer");
    });
  });

  describe("Badge Component (§5.12)", () => {
    it("renderiza variantes semánticas con tokens oficiales y punto de color obligatorio", () => {
      const success = renderToStaticMarkup(
        React.createElement(Badge, { variant: "success" }, "Confirmada")
      );
      expect(success).toContain("text-success");
      expect(success).toContain("bg-success-soft");
      expect(success).toContain("border-success/20");
      expect(success).toContain("bg-success"); // Punto de color
      expect(success).toContain("Confirmada");

      const warning = renderToStaticMarkup(
        React.createElement(Badge, { variant: "warning" }, "Pendiente")
      );
      expect(warning).toContain("text-warning");
      expect(warning).toContain("bg-warning-soft");
      expect(warning).toContain("border-warning/20");
      expect(warning).toContain("bg-warning");
      expect(warning).toContain("Pendiente");

      const danger = renderToStaticMarkup(
        React.createElement(Badge, { variant: "danger" }, "Cancelada")
      );
      expect(danger).toContain("text-danger");
      expect(danger).toContain("bg-danger-soft");
      expect(danger).toContain("border-danger/20");
      expect(danger).toContain("bg-danger");
      expect(danger).toContain("Cancelada");

      const info = renderToStaticMarkup(
        React.createElement(Badge, { variant: "info" }, "Completada")
      );
      expect(info).toContain("text-grape");
      expect(info).toContain("bg-grape-soft");
      expect(info).toContain("border-grape/20");
      expect(info).toContain("bg-grape");
      expect(info).toContain("Completada");

      const grape = renderToStaticMarkup(
        React.createElement(Badge, { variant: "grape" }, "En progreso")
      );
      expect(grape).toContain("text-grape");
      expect(grape).toContain("bg-grape-soft");
      expect(grape).toContain("border-grape/20");

      const neutral = renderToStaticMarkup(
        React.createElement(Badge, { variant: "neutral" }, "Borrador")
      );
      expect(neutral).toContain("text-text-secondary");
      expect(neutral).toContain("bg-surface-alt");
      expect(neutral).toContain("border-border");
      expect(neutral).toContain("bg-text-secondary");
      expect(neutral).toContain("Borrador");
    });

    it("permite ocultar el punto semántico cuando dot=false", () => {
      const noDot = renderToStaticMarkup(
        React.createElement(Badge, { variant: "success", dot: false }, "Sin punto")
      );
      expect(noDot).toContain("Sin punto");
      expect(noDot).not.toContain("bg-success ");
    });

    it("soporta tamaños sm y md y fusiona className", () => {
      const sm = renderToStaticMarkup(
        React.createElement(Badge, { size: "sm", className: "font-mono" }, "Pequeño")
      );
      expect(sm).toContain("py-0.5 px-2 text-xs");
      expect(sm).toContain("font-mono");

      const md = renderToStaticMarkup(
        React.createElement(Badge, { size: "md" }, "Mediano")
      );
      expect(md).toContain("py-1 px-2.5 text-xs");
    });
  });

  describe("PendingBadge Component (Nuevo componente de UI)", () => {
    it("renderiza con valores por defecto (label 'Pendiente', tooltip explicativo, borde dashed ámbar)", () => {
      const html = renderToStaticMarkup(
        React.createElement(PendingBadge, null)
      );
      expect(html).toContain("Pendiente");
      expect(html).toContain('title="Lógica pendiente de integración en backend"');
      expect(html).toContain("bg-amber-500/10");
      expect(html).toContain("text-amber-700");
      expect(html).toContain("border-dashed");
      expect(html).toContain("border-amber-500/30");
      expect(html).toContain("font-mono");
      expect(html).toContain("text-[10px]");
      expect(html).toContain("cursor-help");
      expect(html).toContain("w-1 h-1 rounded-full bg-amber-500 animate-pulse");
    });

    it("permite customizar label, tooltip y combinar className", () => {
      const html = renderToStaticMarkup(
        React.createElement(PendingBadge, {
          label: "Próximamente",
          tooltip: "Disponible en la fase 2",
          className: "ml-2 shadow-xs",
        })
      );
      expect(html).toContain("Próximamente");
      expect(html).toContain('title="Disponible en la fase 2"');
      expect(html).toContain("ml-2 shadow-xs");
    });
  });

  describe("Modal Component", () => {
    it("retorna null si isOpen es false", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          Modal,
          { isOpen: false, onClose: () => {} },
          "Contenido oculto"
        )
      );
      expect(html).toBe("");
    });

    it("renderiza backdrop, contenedor accesible, título y contenido si isOpen es true", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          Modal,
          {
            isOpen: true,
            onClose: () => {},
            title: "Confirmar Reserva",
            description: "Esta acción enviará una notificación al cliente",
          },
          React.createElement("p", null, "Detalles de la cita")
        )
      );

      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain("fixed inset-0 z-50");
      expect(html).toContain("backdrop-blur-xs");
      expect(html).toContain("Confirmar Reserva");
      expect(html).toContain("Esta acción enviará una notificación al cliente");
      expect(html).toContain("Detalles de la cita");
      expect(html).toContain('aria-label="Cerrar"');
    });

    it("renderiza contenido sin título ni descripción sin romper la estructura", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          Modal,
          {
            isOpen: true,
            onClose: () => {},
          },
          React.createElement("span", null, "Solo contenido")
        )
      );

      expect(html).toContain('role="dialog"');
      expect(html).toContain("Solo contenido");
      expect(html).not.toContain('aria-label="Cerrar"');
    });
  });

  describe("Table Component (§5.5)", () => {
    it("renderiza estructura completa de tabla alineada a §5.5 (surface-alt sticky header, sentence-case, h-12 rows)", () => {
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
          ),
          React.createElement(
            TableBody,
            null,
            React.createElement(
              TableRow,
              null,
              React.createElement(TableCell, null, "Juan Pérez"),
              React.createElement(TableCell, null, "Corte de Cabello"),
              React.createElement(TableCell, null, "Confirmado")
            )
          )
        )
      );

      // Wrapper table con divide-border
      expect(html).toContain("min-w-full divide-y divide-border");
      // TableHeader sticky y con surface-alt
      expect(html).toContain("bg-surface-alt border-b border-border sticky top-0");
      // TableHead en sentence case, sin uppercase
      expect(html).toContain("text-start text-xs font-medium text-text-secondary");
      expect(html).not.toContain("uppercase");
      // TableRow con 48px (h-12) y hover:bg-surface-alt
      expect(html).toContain("hover:bg-surface-alt transition-colors h-12");
      // TableCell con text-text-primary y borde border-border/50
      expect(html).toContain("whitespace-nowrap text-sm text-text-primary border-b border-border/50");
      expect(html).toContain("Juan Pérez");
      expect(html).toContain("Corte de Cabello");
    });
  });

  describe("ProcessingOverlay Component", () => {
    it("renderiza estructura de ticket risográfico, actividad y texto fijo", () => {
      const html = renderToStaticMarkup(
        React.createElement(ProcessingOverlay, {
          isOpen: true,
          process: "reserva",
          lang: "es",
        })
      );

      expect(html).toContain("ticket");
      expect(html).toContain("ticket-on-ink");
      expect(html).toContain("w-[320px]");
      expect(html).toContain("agendur-pulse-dot");
      expect(html).toContain("Verificando disponibilidad…");
      expect(html).toContain("perforacion");
      expect(html).toContain("Esto puede tardar unos segundos.");
    });

    it("soporta variante fullscreen con fondo sólido --ink", () => {
      const html = renderToStaticMarkup(
        React.createElement(ProcessingOverlay, {
          isOpen: true,
          variant: "fullscreen",
        })
      );

      expect(html).toContain("bg-[var(--ink,#1d1720)]");
    });
  });
});
