import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReportesPage from "@/app/(negocio)/reportes/page";
import ReportesLoading from "@/app/(negocio)/reportes/loading";

function renderWithClient(element: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  client.setQueryData(["negocio", "sucursales"], {
    sucursales: [
      { id: "suc-1", nombre: "Sucursal Matriz Centro" },
      { id: "suc-2", nombre: "Sucursal Providencia" },
    ],
  });

  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>{element}</QueryClientProvider>
  );
  client.clear();
  return html;
}

describe("Módulo de Reportes y Analítica (/reportes) — Tests de UI/UX", () => {
  it("debe renderizar el encabezado y el botón de exportar con PendingBadge", () => {
    const html = renderWithClient(<ReportesPage />);

    // In static SSR rendering without mounted, ReportesLoading is rendered
    expect(html).toContain("Reportes");
    expect(html).toContain("Exportar informe");
    expect(html).toContain("Pendiente");
  });

  it("debe renderizar el loading skeleton de reportes con réplicas de gráficas y KPIs", () => {
    const html = renderToStaticMarkup(<ReportesLoading />);

    expect(html).toContain("skel-block");
    expect(html).toContain("skel-text");
    expect(html).toContain("aria-busy=\"true\"");
    expect(html).toContain("h-[280px]");
    expect(html).toContain("h-[300px]");
  });
});
