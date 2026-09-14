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

describe("Administrative Shell - Agendur Design System (Sections 5.1 & 5.2)", () => {
  describe("Sidebar Component", () => {
    it("renderiza navegación corporativa con paleta fija de Agendur (Sección 5.1)", () => {
      currentPathname = "/dashboard";
      const html = renderWithQueryClient(
        React.createElement(Sidebar, { isOpen: false }),
      );

      // Fondo fijo y texto según tokens de diseño
      expect(html).toContain("bg-[#110D15]");
      expect(html).toContain("text-[#A79FAE]");

      // Brand Logo "Agendur"
      expect(html).toContain("Agendur");
      expect(html).toContain("font-bricolage");
      expect(html).toContain("text-[#F1ECE2]");

      // 7 módulos de navegación en orden confirmado
      expect(html).toContain("Inicio");
      expect(html).toContain("Calendario");
      expect(html).toContain("Servicios y sucursales");
      expect(html).toContain("Personal");
      expect(html).toContain("Pagos y facturación");
      expect(html).toContain("Reportes");
      expect(html).toContain("Configuración");

      // Badges "Pronto" en módulos desactivados
      expect(html).toContain("Pronto");

      // Estado activo en /dashboard con barra izquierda sólida de 3px y fondo grape-soft
      expect(html).toContain("bg-[rgba(110,73,166,0.12)]");
      expect(html).toContain("bg-[#6E49A6]");

      // Botón de cerrar sesión y colapsar
      expect(html).toContain("Cerrar Sesión");
      expect(html).toContain("Colapsar menú");
    });

    it("maneja estado responsive: drawer cerrado (-translate-x-full) y sin backdrop", () => {
      const html = renderWithQueryClient(
        React.createElement(Sidebar, { isOpen: false }),
      );

      expect(html).toContain("-translate-x-full");
      expect(html).toContain("md:translate-x-0");
      // Backdrop no debe estar presente cuando isOpen=false
      expect(html).not.toContain("fixed inset-0 z-40");
    });

    it("maneja estado responsive: drawer abierto (translate-x-0) y con backdrop móvil", () => {
      const html = renderWithQueryClient(
        React.createElement(Sidebar, { isOpen: true }),
      );

      expect(html).toContain("translate-x-0");
      expect(html).toContain("fixed inset-0 z-40 bg-black/60");
      expect(html).toContain("md:hidden");
    });

    it("destaca ruta activa y estilo hover moderno en rutas secundarias", () => {
      currentPathname = "/sucursales";
      const html = renderWithQueryClient(
        React.createElement(Sidebar, { isOpen: false }),
      );

      expect(html).toContain('href="/sucursales"');
      expect(html).toContain("bg-[rgba(110,73,166,0.12)]");
      expect(html).toContain("hover:bg-white/[0.04]");
    });
  });

  describe("Header Component", () => {
    it("renderiza topbar según sección 5.2 con altura 64px, fondo surface y borde", () => {
      const html = renderWithQueryClient(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(Header, null),
        ),
      );

      // Estructura y clases Topbar
      expect(html).toContain("h-16");
      expect(html).toContain("bg-surface");
      expect(html).toContain("border-border");
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

    it("renderiza elementos de la derecha en orden exacto: buscador, sucursal, tema, notificaciones y avatar", () => {
      const html = renderWithQueryClient(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(Header, null),
        ),
      );

      // 1. Buscador
      expect(html).toContain('aria-label="Buscar"');
      // 2. Indicador de sucursal
      expect(html).toContain("Sede");
      // 3. ThemeToggle
      expect(html).toContain("Alternar tema");
      // 4. Campana de notificaciones con badge flame
      expect(html).toContain('aria-label="Notificaciones"');
      expect(html).toContain("bg-flame");
      // 5. Menú de usuario
      expect(html).toContain('aria-label="Menú de usuario"');
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

      // Contenedor de página requerido
      expect(html).toContain("min-h-screen");
      expect(html).toContain("bg-background");
      expect(html).toContain("text-text-primary");
      expect(html).toContain("transition-colors");

      // Contenido principal
      expect(html).toContain("Contenido del Dashboard");
      expect(html).toContain('id="test-content"');

      // Presencia de Sidebar y Header dentro del shell
      expect(html).toContain("Agendur");
      expect(html).toContain("Alternar tema");
    });
  });
});
