import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PersonalPage from "@/app/(negocio)/personal/page";
import { ROLE_CAPABILITIES, type NegocioRole } from "@/lib/auth/negocio-access";

function render(role: NegocioRole, tab: "directorio" | "horarios" = "directorio", empty = false) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(["auth", "me"], { access: { role, capabilities: ROLE_CAPABILITIES[role] } });
  client.setQueryData(["negocio", "sucursales"], { sucursales: [{ id: "branch", nombre: "Central" }] });
  client.setQueryData(["negocio", "servicios"], { servicios: [{ id: "service", nombre: "Corte" }] });
  client.setQueryData(["negocio", "personal"], { personal: empty ? [] : [{
    id: "professional", kind: "professional", nombre: "Ana", apellido: "López",
    email: "ana@example.com", rol: "professional", sucursalId: "branch",
    usuarioId: "user", activo: true, servicioIds: ["service"],
    horarios: [{ dia_semana: 1, hora_inicio: "08:30:00", hora_fin: "12:00:00" }],
  }] });
  const html = renderToStaticMarkup(<QueryClientProvider client={client}><PersonalPage initialTab={tab} /></QueryClientProvider>);
  client.clear();
  return html;
}

describe("Directorio real de personal", () => {
  it("muestra datos del backend y controles sólo al dueño", () => {
    const html = render("owner");
    for (const value of ["Ana", "López", "Central", "Corte", "Acceso vinculado", "Registrar Colaborador", "Desactivar"]) expect(html).toContain(value);
  });
  it("mantiene el directorio de recepción sin controles de administración", () => {
    const html = render("receptionist");
    expect(html).toContain("Ana");
    expect(html).not.toContain("Registrar Colaborador");
    expect(html).not.toContain("Desactivar");
  });
  it("no expone el directorio al profesional", () => {
    const html = render("professional");
    expect(html).toContain("No tienes permiso");
    expect(html).not.toContain("ana@example.com");
  });
  it("muestra únicamente horarios almacenados, no turnos inventados", () => {
    const html = render("owner", "horarios");
    expect(html).toContain("Lunes 08:30–12:00");
    expect(html).not.toContain("09:00–18:00");
  });
  it("ofrece un estado vacío real", () => {
    expect(render("owner", "directorio", true)).toContain("Aún no tienes personal registrado");
  });
});
