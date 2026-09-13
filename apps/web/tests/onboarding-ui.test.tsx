import { describe, expect, it, mock } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

mock.module("next/navigation", () => ({
  useRouter: () => ({ push: mock(), replace: mock(), refresh: mock() }),
  usePathname: () => "/onboarding",
}));

import OnboardingPage from "@/app/(negocio)/onboarding/page";
import DashboardPage from "@/app/(negocio)/dashboard/page";
import { Header } from "@/components/negocio/Header";
import { Sidebar } from "@/components/negocio/Sidebar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

function render(element: React.ReactElement, auth: Record<string, unknown> | null, branches: Array<Record<string, unknown>> = []) {
  const client = new QueryClient();
  if (auth) client.setQueryData(["auth", "me"], auth);
  client.setQueryData(["negocio", "sucursales"], { sucursales: branches });
  client.setQueryData(["negocio", "configuracion"], { configuracion: { nombreNegocio: "Mi negocio", giroComercial: "Salón" } });
  const html = renderToStaticMarkup(React.createElement(QueryClientProvider, { client }, element));
  client.clear();
  return html;
}

const newOwner = {
  user: { id: "owner-1", email: "ana@example.com" },
  perfil: { nombres: "Ana", apellidos: "López", telefono: null, locale: "es-MX" },
  negocio: { id: "neg-1", nombre_comercial: "Mi negocio", slug: "mi-negocio", giro_comercial: "Salón" },
  onboardingStatus: "required",
  sucursalesCount: 0,
  suscripcion: null,
};

describe("Oleada 2 B: interfaz de inicio", () => {
  it("muestra formulario de identidad, negocio y primera sucursal", () => {
    const html = render(React.createElement(OnboardingPage), newOwner);
    expect(html).toContain("Completa tu negocio");
    expect(html).toContain("Primera sucursal");
    expect(html).toContain('name="nombres"');
    expect(html).toContain('name="codigo_postal"');
  });

  it("dashboard muestra estado inicial sin afirmar que el portal está activo", () => {
    const html = render(React.createElement(DashboardPage), newOwner);
    expect(html).toContain('href="/onboarding"');
    expect(html).toContain("primera sucursal");
    expect(html).not.toContain("Tu portal de reservas está activo");
  });

  it("dashboard no afirma actividad antes de conocer la identidad", () => {
    const html = render(React.createElement(DashboardPage), null);
    expect(html).toContain("Cargando");
    expect(html).not.toContain("Tu portal de reservas está activo");
  });

  it("header usa nombre de persona y muestra cero sedes", () => {
    const html = render(React.createElement(ThemeProvider, null, React.createElement(Header)), newOwner);
    expect(html).toContain("Ana López");
    expect(html).toContain("0 Sedes");
  });

  it("no anuncia el portal como activo antes de la primera sucursal", () => {
    const html = render(React.createElement(Sidebar), newOwner);
    expect(html).toContain('href="/onboarding"');
    expect(html).toContain("Completar negocio");
    expect(html).not.toContain("En vivo");
  });

  it("no crea otra primera sede para una cuenta ya configurada", () => {
    const html = render(React.createElement(OnboardingPage), { ...newOwner, onboardingStatus: "complete" }, [{ id: "branch-1" }]);
    expect(html).toContain("onboarding está completo");
    expect(html).not.toContain('name="nombre_sucursal"');
  });

  it("muestra un error explícito si la cuenta no tiene negocio", () => {
    const html = render(React.createElement(OnboardingPage), { ...newOwner, negocio: null });
    expect(html).toContain("no tiene un negocio asociado");
    expect(html).not.toContain('name="nombre_sucursal"');
  });
});
