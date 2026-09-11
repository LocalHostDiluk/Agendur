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
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";

describe("UI Kit Base - Preline UI Components", () => {
  describe("Button Component", () => {
    it("renderiza botón con variante por defecto (primary) y tamaño md", () => {
      const html = renderToStaticMarkup(
        React.createElement(Button, null, "Guardar")
      );
      expect(html).toContain("Guardar");
      expect(html).toContain("bg-blue-600");
      expect(html).toContain("text-white");
      expect(html).toContain("py-2.5 px-4 text-sm");
      expect(html).toContain("rounded-lg");
    });

    it("soporta todas las variantes de Preline UI", () => {
      const primary = renderToStaticMarkup(
        React.createElement(Button, { variant: "primary" }, "Primary")
      );
      expect(primary).toContain("bg-blue-600");

      const secondary = renderToStaticMarkup(
        React.createElement(Button, { variant: "secondary" }, "Secondary")
      );
      expect(secondary).toContain("bg-gray-100");
      expect(secondary).toContain("dark:bg-neutral-700");

      const outline = renderToStaticMarkup(
        React.createElement(Button, { variant: "outline" }, "Outline")
      );
      expect(outline).toContain("border border-gray-200");
      expect(outline).toContain("dark:border-neutral-700");

      const ghost = renderToStaticMarkup(
        React.createElement(Button, { variant: "ghost" }, "Ghost")
      );
      expect(ghost).toContain("hover:bg-gray-100");
      expect(ghost).toContain("dark:hover:bg-neutral-800");

      const danger = renderToStaticMarkup(
        React.createElement(Button, { variant: "danger" }, "Danger")
      );
      expect(danger).toContain("bg-red-500");
      expect(danger).toContain("text-white");
    });

    it("soporta todos los tamaños (sm, md, lg)", () => {
      const sm = renderToStaticMarkup(
        React.createElement(Button, { size: "sm" }, "Small")
      );
      expect(sm).toContain("py-2 px-3 text-xs");

      const md = renderToStaticMarkup(
        React.createElement(Button, { size: "md" }, "Medium")
      );
      expect(md).toContain("py-2.5 px-4 text-sm");

      const lg = renderToStaticMarkup(
        React.createElement(Button, { size: "lg" }, "Large")
      );
      expect(lg).toContain("py-3 px-5 text-base");
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

  describe("Card Component y Subcomponentes", () => {
    it("renderiza Card completa con todos sus subcomponentes", () => {
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

      // Card container
      expect(html).toContain("rounded-xl");
      expect(html).toContain("border-gray-200");
      expect(html).toContain("dark:bg-neutral-900");
      expect(html).toContain("dark:border-neutral-700");
      expect(html).toContain("custom-card");

      // CardHeader
      expect(html).toContain("border-b");
      expect(html).toContain("custom-header");

      // CardTitle & Description
      expect(html).toContain("<h3");
      expect(html).toContain("Detalle del Negocio");
      expect(html).toContain("<p");
      expect(html).toContain("Gestiona tu información");

      // CardContent & Footer
      expect(html).toContain("Contenido de prueba");
      expect(html).toContain("custom-content");
      expect(html).toContain("border-t");
      expect(html).toContain("Pie de tarjeta");
      expect(html).toContain("custom-footer");
    });
  });

  describe("Badge Component", () => {
    it("renderiza variantes semánticas con fondos suaves y contraste", () => {
      const success = renderToStaticMarkup(
        React.createElement(Badge, { variant: "success" }, "Activo")
      );
      expect(success).toContain("bg-teal-100");
      expect(success).toContain("text-teal-800");
      expect(success).toContain("dark:bg-teal-500/10");
      expect(success).toContain("dark:text-teal-400");

      const warning = renderToStaticMarkup(
        React.createElement(Badge, { variant: "warning" }, "Pendiente")
      );
      expect(warning).toContain("bg-amber-100");
      expect(warning).toContain("text-amber-800");

      const danger = renderToStaticMarkup(
        React.createElement(Badge, { variant: "danger" }, "Cancelado")
      );
      expect(danger).toContain("bg-red-100");
      expect(danger).toContain("text-red-800");

      const info = renderToStaticMarkup(
        React.createElement(Badge, { variant: "info" }, "Nuevo")
      );
      expect(info).toContain("bg-blue-100");
      expect(info).toContain("text-blue-800");

      const neutral = renderToStaticMarkup(
        React.createElement(Badge, { variant: "neutral" }, "Borrador")
      );
      expect(neutral).toContain("bg-gray-100");
      expect(neutral).toContain("text-gray-800");
    });

    it("soporta tamaños sm y md y fusiona className", () => {
      const sm = renderToStaticMarkup(
        React.createElement(Badge, { size: "sm", className: "uppercase" }, "Pequeño")
      );
      expect(sm).toContain("py-0.5 px-2 text-xs");
      expect(sm).toContain("uppercase");

      const md = renderToStaticMarkup(
        React.createElement(Badge, { size: "md" }, "Mediano")
      );
      expect(md).toContain("py-1 px-2.5 text-xs");
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

  describe("Table Component", () => {
    it("renderiza estructura completa de tabla con clases Preline UI", () => {
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

      // Wrapper table Preline
      expect(html).toContain("min-w-full divide-y divide-gray-200 dark:divide-neutral-700");
      expect(html).toContain("bg-gray-50 dark:bg-neutral-800");
      expect(html).toContain("text-start text-xs font-medium text-gray-500 uppercase");
      expect(html).toContain("hover:bg-gray-50 dark:hover:bg-neutral-800/50");
      expect(html).toContain("whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200");
      expect(html).toContain("Juan Pérez");
      expect(html).toContain("Corte de Cabello");
    });
  });
});
