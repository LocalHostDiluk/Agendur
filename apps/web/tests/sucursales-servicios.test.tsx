import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SucursalesPage from "@/app/(negocio)/sucursales/page";

const mockSucursales = [
  {
    id: "suc-1",
    nombre: "Sucursal Central Polanco",
    es_matriz: true,
    direccion: "Av. Horacio 450",
    ciudad: "CDMX",
    estado_provincia: "CDMX",
    codigo_postal: "11560",
    telefono: "+52 55 4160 0001",
    activa: true,
    personalCount: 5,
  },
  {
    id: "suc-2",
    nombre: "Sucursal Roma Norte",
    es_matriz: false,
    direccion: "Colima 180",
    ciudad: "CDMX",
    estado_provincia: "CDMX",
    codigo_postal: "06700",
    telefono: "+52 55 4160 0002",
    activa: false,
    personalCount: 2,
  },
];

const mockServicios = [
  {
    id: "serv-1",
    nombre: "Corte de Cabello Clásico",
    descripcion: "Corte tradicional con lavado y peinado",
    duracion_minutos: 45,
    precio: 350,
    moneda: "MXN",
    activo: true,
  },
  {
    id: "serv-2",
    nombre: "Afeitado con Toalla Caliente",
    descripcion: "Ritual completo de afeitado tradicional",
    duracion_minutos: 30,
    precio: 280,
    moneda: "MXN",
    activo: false,
  },
];

function renderComponent(
  element: React.ReactElement,
  options?: {
    auth?: unknown;
    sucursales?: unknown[];
    servicios?: unknown[];
  },
) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  client.setQueryData(
    ["auth", "me"],
    options?.auth ?? {
      negocio: {
        id: "neg-1",
        nombre_comercial: "Barbería Agendur",
        slug: "barberia-agendur",
      },
    },
  );

  client.setQueryData(["negocio", "sucursales"], {
    sucursales: options?.sucursales ?? mockSucursales,
  });

  client.setQueryData(["negocio", "servicios"], {
    servicios: options?.servicios ?? mockServicios,
  });

  const html = renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client }, element),
  );
  client.clear();
  return html;
}

describe("Página de Sucursales y Servicios (apps/web/app/(negocio)/sucursales/page.tsx)", () => {
  it("renderiza el encabezado principal con tipografía Bricolage y selector de pestañas", () => {
    const html = renderComponent(<SucursalesPage />);

    // Encabezado
    expect(html).toContain("Servicios y sucursales");
    expect(html).toContain("font-bricolage");
    expect(html).toContain("Administra las sedes físicas de tu negocio");

    // Selector de pestañas accesible
    expect(html).toContain('role="tablist"');
    expect(html).toContain('id="tab-sucursales"');
    expect(html).toContain('id="tab-servicios"');
    expect(html).toContain("Sucursales");
    expect(html).toContain("Servicios");

    // Botón de acción
    expect(html).toContain("Agregar Sucursal");
  });

  it("renderiza tarjetas de sucursales con badge MATRIZ, estado ACTIVA/INACTIVA y enlace a portal", () => {
    const html = renderComponent(<SucursalesPage />);

    // Datos de la primera sucursal (Matriz y Activa)
    expect(html).toContain("Sucursal Central Polanco");
    expect(html).toContain("MATRIZ");
    expect(html).toContain("ACTIVA");
    expect(html).toContain("Av. Horacio 450");
    expect(html).toContain("+52 55 4160 0001");
    expect(html).toContain("5 Profesionales");

    // Enlace público al portal
    expect(html).toContain("/reserva/barberia-agendur");
    expect(html).toContain("Portal público");

    // Datos de la segunda sucursal (Inactiva)
    expect(html).toContain("Sucursal Roma Norte");
    expect(html).toContain("INACTIVA");
    expect(html).toContain("+52 55 4160 0002");
    expect(html).toContain("2 Profesionales");
  });

  it("renderiza estado vacío cuando no existen sucursales registradas", () => {
    const html = renderComponent(<SucursalesPage />, {
      sucursales: [],
    });

    expect(html).toContain("Aún no tienes sucursales registradas");
    expect(html).toContain("Crear primera sucursal");
  });

  it("cumple tokens de pestañas canónicas y botón de acción contextual con Button primitivo", () => {
    const html = renderComponent(<SucursalesPage />);

    // Tokens canónicos de pestañas (§5.4, §5.5)
    expect(html).toContain(
      "bg-surface-alt/70 border border-border rounded-xl text-xs sm:text-sm font-medium",
    );

    // Botón primario oficial Button
    expect(html).toContain("bg-grape text-white");
    expect(html).toContain("Agregar Sucursal");
  });

  it("implementa transformación responsive (§8): tabla desktop (hidden sm:table) y lista de cards (block sm:hidden)", () => {
    const html = renderComponent(<SucursalesPage />);

    // Tabla desktop
    expect(html).toContain("hidden sm:table");

    // Cards mobile apiladas
    expect(html).toContain("block sm:hidden");

    // Tipografía Bricolage Grotesque y Space Mono en cards
    expect(html).toContain("font-bricolage");
    expect(html).toContain("font-mono");

    // Pares clave:valor en vista móvil
    expect(html).toContain("Dirección:");
    expect(html).toContain("Teléfono:");
    expect(html).toContain("Equipo:");
  });

  it("utiliza primitivas oficiales Badge y Button con acciones accesibles", () => {
    const html = renderComponent(<SucursalesPage />);

    // Badge oficial
    expect(html).toContain("inline-flex items-center gap-x-1.5 font-medium rounded-full");
    expect(html).toContain("text-success bg-success-soft");

    // Botones con variante danger para eliminación
    expect(html).toContain("bg-danger text-white");
    expect(html).toContain("aria-label=\"Eliminar sucursal Sucursal Central Polanco\"");
  });

  it("muestra marcas de funcionalidad pendiente con PendingBadge", () => {
    const html = renderComponent(<SucursalesPage />);

    // PendingBadge visible
    expect(html).toContain("Pendiente");
    expect(html).toContain("Sincronización automática de sucursales con Google Business");
  });
});

