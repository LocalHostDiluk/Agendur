import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AgendasPage from "@/app/(negocio)/agendas/page";
import type { Cita } from "@/lib/types";

const mockCitas: Cita[] = [
  {
    id: "cita-123456",
    negocio_id: "neg-1",
    sucursal_id: "suc-1",
    servicio_id: "serv-1",
    profesional_id: "prof-1",
    cliente_nombre: "Juan",
    cliente_apellido: "Pérez",
    cliente_telefono: "+525512345678",
    cliente_email: "juan@example.com",
    fecha: "2026-09-17",
    hora_inicio: "10:00",
    hora_fin: "10:45",
    estado: "confirmada",
    precio_total: 350,
    notas_cliente: "Primera vez en el local",
  },
  {
    id: "cita-789012",
    negocio_id: "neg-1",
    sucursal_id: "suc-1",
    servicio_id: "serv-2",
    profesional_id: "prof-1",
    cliente_nombre: "María",
    cliente_apellido: "González",
    cliente_telefono: "+525598765432",
    cliente_email: "maria@example.com",
    fecha: "2026-09-17",
    hora_inicio: "12:30",
    hora_fin: "13:00",
    estado: "pendiente_pago",
    precio_total: 280,
    notas_cliente: null,
  },
];

const mockSucursales = [
  {
    id: "suc-1",
    nombre: "Sucursal Central",
    es_matriz: true,
    direccion: "Av. Principal 100",
    ciudad: "CDMX",
    telefono: "+525511112222",
    activa: true,
  },
];

const mockServicios = [
  {
    id: "serv-1",
    nombre: "Corte de Cabello",
    duracion_minutos: 45,
    precio: 350,
    activo: true,
  },
  {
    id: "serv-2",
    nombre: "Barba & Toalla",
    duracion_minutos: 30,
    precio: 280,
    activo: true,
  },
];

function renderComponent(
  element: React.ReactElement,
  options?: {
    citas?: Cita[];
    sucursales?: typeof mockSucursales;
    servicios?: typeof mockServicios;
    isLoading?: boolean;
  },
) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  client.setQueryData(["auth", "me"], {
    negocio: {
      id: "neg-1",
      nombre_comercial: "Barbería Agendur",
      slug: "barberia-agendur",
      zona_horaria: "America/Mexico_City",
    },
  });

  client.setQueryData(["negocio", "sucursales"], {
    sucursales: options?.sucursales ?? mockSucursales,
  });

  client.setQueryData(["negocio", "servicios"], {
    servicios: options?.servicios ?? mockServicios,
  });

  client.setQueryData(["cliente", "catalogo", "barberia-agendur"], {
    data: {
      profesionales: [
        { id: "prof-1", nombre: "Carlos Méndez", sucursal_id: "suc-1" },
      ],
    },
  });

  // Pre-cargar citas con fecha de hoy simulada salvo si isLoading es true
  const today = "2026-09-17";
  const citasData = { citas: options?.citas ?? mockCitas };

  if (!options?.isLoading) {
    client.setQueryData(
      ["negocio", "citas", { fechaInicio: today, fechaFin: today }],
      citasData,
    );
    client.setQueryData(["negocio", "citas", undefined], citasData);
    client.setQueryData(["negocio", "citas", {}], citasData);
  }

  const html = renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client }, element),
  );
  client.clear();
  return html;
}

describe("Página de Calendario y Agendas (apps/web/app/(negocio)/agendas/page.tsx)", () => {
  it("renderiza el encabezado con Bricolage Grotesque y botón de cita manual", () => {
    const html = renderComponent(<AgendasPage />);

    expect(html).toContain("Calendario &amp; Agendas");
    expect(html).toContain("font-bricolage");
    expect(html).toContain("Agendar Cita Manual");
  });

  it("renderiza la barra de navegación de fechas y alternador de vistas accesible", () => {
    const html = renderComponent(<AgendasPage />);

    expect(html).toContain("Hoy");
    expect(html).toContain('aria-label="Fecha anterior"');
    expect(html).toContain('aria-label="Fecha siguiente"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain("Cronograma");
    expect(html).toContain("Semanal");
    expect(html).toContain("Todos los estados");
  });

  it("renderiza citas en vista de cronograma con folios en Space Mono, clientes y badges de estado", () => {
    const html = renderComponent(<AgendasPage />);

    // Folios formateados
    expect(html).toContain("#AG-CITA-1");
    expect(html).toContain("#AG-CITA-7");

    // Datos del cliente
    expect(html).toContain("Juan Pérez");
    expect(html).toContain("María González");

    // Badges de estado
    expect(html).toContain("CONFIRMADA");
    expect(html).toContain("PENDIENTE PAGO");

    // Horas en Space Mono
    expect(html).toContain("10:00");
    expect(html).toContain("12:30");
  });

  it("renderiza estado vacío cuando no existen citas registradas para la fecha", () => {
    const html = renderComponent(<AgendasPage />, {
      citas: [],
    });

    expect(html).toContain("No hay citas programadas para este período");
    expect(html).toContain("Agendar Cita Manual");
  });

  it("debe mostrar el esqueleto de carga con skeletons risográficos cuando está en progreso", () => {
    const html = renderComponent(<AgendasPage />, { isLoading: true });

    expect(html).toContain('data-testid="agenda-loading"');
    expect(html).toContain("skel-block");
    expect(html).toContain("skel-text");
  });
});
