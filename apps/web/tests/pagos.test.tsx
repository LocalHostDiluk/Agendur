import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PagosPage from "@/app/(negocio)/pagos/page";
import PagosLoading from "@/app/(negocio)/pagos/loading";

function renderWithClient(element: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>{element}</QueryClientProvider>
  );
  client.clear();
  return html;
}

describe("Módulo de Pagos y Facturación (/pagos) — Tests de UI/UX", () => {
  it("debe renderizar el encabezado y el botón de exportar con PendingBadge", () => {
    const html = renderWithClient(<PagosPage />);

    expect(html).toContain("Pagos y Facturación");
    expect(html).toContain("Supervisa los cobros de anticipos");
    expect(html).toContain("Exportar transacciones");
    expect(html).toContain("Pendiente");
  });

  it("debe renderizar el banner informativo con PendingBadge 'Datos Simulados' (§10, §382)", () => {
    const html = renderWithClient(<PagosPage />);

    expect(html).toContain("Datos Simulados");
    expect(html).toContain("Módulo Visual Preliminar de Transacciones");
    expect(html).toContain("Stripe Connect Activo");
  });

  it("debe renderizar los 3 KPIs de Pagos con cifras en Space Mono 32px bold tabular-nums (§10, §382)", () => {
    const html = renderWithClient(<PagosPage />);

    // KPI 1 destacada
    expect(html).toContain("Total Ingresos del Mes");
    expect(html).toContain("$48,250.00 MXN");

    // KPI 2
    expect(html).toContain("Anticipos Recaudados");
    expect(html).toContain("$14,800.00 MXN");

    // KPI 3
    expect(html).toContain("Pagos Pendientes");
    expect(html).toContain("$5,600.00 MXN");

    // Tipografía y formato Space Mono
    expect(html).toContain("font-mono text-[32px] tabular-nums font-bold");
  });

  it("debe renderizar la tabla de transacciones con IDs en Space Mono y Badges de estado con punto (§5.12)", () => {
    const html = renderWithClient(<PagosPage />);

    // Transacciones mock
    expect(html).toContain("#TX-9481");
    expect(html).toContain("Valeria Morales");
    expect(html).toContain("Corte &amp; Estilo Personalizado");
    expect(html).toContain("Pagado");
    expect(html).toContain("Pendiente");
    expect(html).toContain("Reembolsado");

    // Controles de búsqueda y filtros
    expect(html).toContain("Buscar por cliente, correo, servicio o ID...");
    expect(html).toContain("Todos los estados");
    expect(html).toContain("Todos los métodos");
  });

  it("debe implementar vista responsive mobile con cards apiladas (§8)", () => {
    const html = renderWithClient(<PagosPage />);

    expect(html).toContain("hidden sm:block"); // Desktop table
    expect(html).toContain("block sm:hidden"); // Mobile cards
  });

  it("debe renderizar el loading skeleton de pagos correctamente", () => {
    const html = renderToStaticMarkup(<PagosLoading />);

    expect(html).toContain("skel-block");
    expect(html).toContain("skel-text");
    expect(html).toContain("aria-busy=\"true\"");
  });
});
