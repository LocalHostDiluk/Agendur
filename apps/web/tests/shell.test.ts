import { describe, it, expect, mock } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock next/navigation
let currentPathname = "/dashboard";
mock.module("next/navigation", () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({
    push: mock(),
    refresh: mock(),
  }),
}));

import { Sidebar } from "@/components/negocio/Sidebar";
import { Header } from "@/components/negocio/Header";
import NegocioLayout from "@/app/(negocio)/layout";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

function renderWithQueryClient(element: React.ReactElement) {
  const queryClient = new QueryClient();
  const html = renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: queryClient }, element),
  );
  queryClient.clear();
  return html;
}

describe("Administrative Shell - Preline UI v5", () => {
  describe("Sidebar Component", () => {
    it("renderiza navegación corporativa con paleta neutra de Preline UI", () => {
      currentPathname = "/dashboard";
      const html = renderWithQueryClient(
        React.createElement(Sidebar, { isOpen: false }),
      );

      // Paleta neutra de Preline
      expect(html).toContain("bg-white");
      expect(html).toContain("dark:bg-neutral-900");
      expect(html).toContain("border-gray-200");
      expect(html).toContain("dark:border-neutral-700");

      // Brand
      expect(html).toContain("CitaSync");
      expect(html).toContain("Panel Negocio");

      // Links
      expect(html).toContain("Resumen");
      expect(html).toContain("Sucursales");
      expect(html).toContain("Agendas &amp; Citas");

      // Active state badge en /dashboard
      expect(html).toContain("Activo");

      // Botones inferiores
      expect(html).toContain("Ver Portal Cliente");
      expect(html).toContain("Cerrar Sesión");
      expect(html).toContain("Volver a Landing");
    });

    it("maneja estado responsive: drawer cerrado (-translate-x-full) y sin backdrop", () => {
      const html = renderWithQueryClient(
        React.createElement(Sidebar, { isOpen: false }),
      );

      expect(html).toContain("-translate-x-full");
      expect(html).toContain("md:translate-x-0");
      // Backdrop no debe estar presente cuando isOpen=false
      expect(html).not.toContain("fixed inset-0 z-40 bg-gray-900/50");
    });

    it("maneja estado responsive: drawer abierto (translate-x-0) y con backdrop móvil", () => {
      const html = renderWithQueryClient(
        React.createElement(Sidebar, { isOpen: true }),
      );

      expect(html).toContain("translate-x-0");
      expect(html).toContain("fixed inset-0 z-40 bg-gray-900/50");
      expect(html).toContain("md:hidden");
    });

    it("destaca ruta activa y estilo hover moderno en rutas secundarias", () => {
      currentPathname = "/sucursales";
      const html = renderWithQueryClient(
        React.createElement(Sidebar, { isOpen: false }),
      );

      expect(html).toContain('href="/sucursales"');
      expect(html).toContain("Activo");
      expect(html).toContain("hover:bg-gray-100");
      expect(html).toContain("dark:hover:bg-neutral-800");
    });
  });

  describe("Header Component", () => {
    it("renderiza navbar con estilo Preline UI y backdrop blur", () => {
      const html = renderWithQueryClient(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(Header, null),
        ),
      );

      // Estructura y clases Preline
      expect(html).toContain("h-16");
      expect(html).toContain("bg-white/80");
      expect(html).toContain("dark:bg-neutral-900/80");
      expect(html).toContain("border-gray-200");
      expect(html).toContain("dark:border-neutral-700");
      expect(html).toContain("backdrop-blur-md");
    });

    it("incluye botón toggle de menú móvil para pantallas pequeñas (md:hidden)", () => {
      const html = renderWithQueryClient(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(Header, null),
        ),
      );

      expect(html).toContain("md:hidden");
      expect(html).toContain('aria-label="Abrir menú de navegación"');
    });

    it("renderiza píldora de negocio con componente Badge y ThemeToggle", () => {
      const html = renderWithQueryClient(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(Header, null),
        ),
      );

      // Píldora de negocio
      expect(html).toContain("Sede");
      // Badge Preline neutral
      expect(html).toContain("bg-gray-100");
      // ThemeToggle
      expect(html).toContain("Alternar tema");
    });
  });

  describe("NegocioLayout Container", () => {
    it("renderiza contenedor con fondo neutro y estructura responsiva", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(
            NegocioLayout,
            { params: Promise.resolve({}) } as unknown as LayoutProps<"/">,
            React.createElement(
              "div",
              { id: "test-content" },
              "Contenido del Dashboard",
            ),
          ),
        ),
      );

      // Fondo de página requerido
      expect(html).toContain("bg-gray-50");
      expect(html).toContain("dark:bg-neutral-950");
      expect(html).toContain("text-gray-800");
      expect(html).toContain("dark:text-neutral-200");

      // Contenido principal
      expect(html).toContain("Contenido del Dashboard");
      expect(html).toContain('id="test-content"');

      // Presencia de Sidebar y Header dentro del shell
      expect(html).toContain("CitaSync");
      expect(html).toContain("Alternar tema");
    });
  });
});
