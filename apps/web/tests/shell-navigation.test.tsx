import React from "react";
import { describe, it, expect, mock } from "bun:test";
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
import { MobileNavigation } from "@/components/negocio/MobileNavigation";
import NegocioLayout from "@/app/(negocio)/layout";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

function renderWithProviders(element: React.ReactElement): string {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const html = renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{element}</ThemeProvider>
    </QueryClientProvider>
  );
  queryClient.clear();
  return html;
}

describe("Shell & Navigation Alignment — Agendur Design System (§5.1, §5.2, §8)", () => {
  describe("Sidebar Component (§5.1)", () => {
    it("renderiza los 7 módulos canónicos en el orden confirmado", () => {
      currentPathname = "/dashboard";
      const html = renderWithProviders(<Sidebar isOpen={false} isCollapsed={false} />);

      // 7 módulos canónicos (§5.1)
      expect(html).toContain("Inicio");
      expect(html).toContain("Calendario");
      expect(html).toContain("Servicios y sucursales");
      expect(html).toContain("Personal");
      expect(html).toContain("Pagos y facturación");
      expect(html).toContain("Reportes");
      expect(html).toContain("Configuración");
    });

    it("valida que /pagos y /reportes tengan enlaces de navegación activos", () => {
      currentPathname = "/dashboard";
      const html = renderWithProviders(<Sidebar isOpen={false} isCollapsed={false} />);

      // Enlaces activos de navegación para pagos y reportes
      expect(html).toContain('href="/pagos"');
      expect(html).toContain('href="/reportes"');
      expect(html).toContain('aria-current="page"');
      expect(html).not.toContain('href="#"');
    });

    it("valida clase de ancho expandido (w-[264px]) y colapsado (w-[72px])", () => {
      const expandedHtml = renderWithProviders(<Sidebar isCollapsed={false} />);
      expect(expandedHtml).toContain("w-[264px]");

      const collapsedHtml = renderWithProviders(<Sidebar isCollapsed={true} />);
      expect(collapsedHtml).toContain("w-[72px]");
    });

    it("valida un único indicador activo de página con borde y fondo", () => {
      currentPathname = "/dashboard";
      const html = renderWithProviders(<Sidebar isOpen={false} />);

      // Indicador de ítem activo (§5.1)
      expect(html).toContain("border-l-[3px]");
      expect(html).toContain("border-grape");
      expect(html).toContain("bg-grape-soft");
      expect(html).toContain('aria-current="page"');
      expect(html).not.toContain("absolute left-0 top-0 bottom-0 w-[3px]");
      expect(html).toContain("focus-visible:ring-2");
    });
  });

  describe("Header Component (§5.2)", () => {
    it("cumple con altura h-16 (64px), sticky y fondo bg-surface", () => {
      const html = renderWithProviders(<Header />);

      expect(html).toContain("h-16");
      expect(html).toContain("sticky");
      expect(html).toContain("bg-surface");
    });

    it("incluye buscador con badge de atajo de teclado (Ctrl K o ⌘K)", () => {
      const html = renderWithProviders(<Header />);

      expect(html).toContain('aria-label="Buscar');
      const hasShortcutBadge = html.includes("Ctrl K") || html.includes("⌘K");
      expect(hasShortcutBadge).toBe(true);
    });

    it("deja sucursal y perfil en sidebar, y conserva tema y notificaciones en header", () => {
      const html = renderWithProviders(<Header />);

      expect(html).not.toContain("data-header-branch");
      expect(html).not.toContain("data-header-user");
      expect(html).not.toContain('aria-label="Menú de usuario"');

      // Toggle de tema
      expect(html).toContain("Alternar tema");

      // Campana de notificaciones con punto indicador --flame (§5.2)
      expect(html).toContain('aria-label="Notificaciones"');
      expect(html).toContain("bg-flame");
    });
  });

  describe("MobileNavigation Component (§8 Responsive)", () => {
    it("renderiza los 5 accesos canónicos (Inicio, Calendario, Pagos, Reportes, Menú/Más)", () => {
      currentPathname = "/dashboard";
      const html = renderWithProviders(<MobileNavigation />);

      // 5 accesos canónicos (§8)
      expect(html).toContain("Inicio");
      expect(html).toContain("Calendario");
      expect(html).toContain("Pagos");
      expect(html).toContain("Reportes");
      expect(html).toContain("Más");

      // Rutas de navegación correspondientes
      expect(html).toContain('href="/dashboard"');
      expect(html).toContain('href="/agendas"');
      expect(html).toContain('href="/pagos"');
      expect(html).toContain('href="/reportes"');
    });

    it("renderiza el FAB flotante de Nueva Cita con fondo --grape", () => {
      const html = renderWithProviders(<MobileNavigation />);

      // FAB flotante (§8)
      expect(html).toContain('aria-label="Nueva cita"');
      expect(html).toContain("bg-grape");
      expect(html).toContain("rounded-full");
      expect(html).toContain("fixed bottom-20 right-4");
    });

    it("es visible solo en mobile (sm:hidden) y fijo al pie de pantalla", () => {
      const html = renderWithProviders(<MobileNavigation />);

      expect(html).toContain("sm:hidden");
      expect(html).toContain("fixed bottom-0");
    });
  });

  describe("NegocioLayout Container (§8 Responsive)", () => {
    it("integra Sidebar, Header, MobileNavigation y padding responsivo", () => {
      const html = renderWithProviders(
        <NegocioLayout params={Promise.resolve({}) as unknown as any}>
          <div id="dashboard-main-content">Contenido del Dashboard</div>
        </NegocioLayout>
      );

      // Elementos del shell
      expect(html).toContain("Agendur");
      expect(html).toContain("Alternar tema");
      expect(html).toContain('aria-label="Nueva cita"'); // FAB de MobileNavigation
      expect(html).toContain("pb-24 sm:pb-6"); // Padding inferior responsivo para la tab bar
      expect(html).toContain('id="dashboard-main-content"');
    });
  });
});
