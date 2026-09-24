import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PersonalPage from "@/app/(negocio)/personal/page";

const mockSucursales = [
  {
    id: "suc-1",
    nombre: "Sucursal Central Polanco",
    es_matriz: true,
    direccion: "Av. Horacio 450",
    ciudad: "CDMX",
    telefono: "+52 55 4160 0001",
    activa: true,
    personalCount: 2,
  },
  {
    id: "suc-2",
    nombre: "Sucursal Roma Norte",
    es_matriz: false,
    direccion: "Colima 180",
    ciudad: "CDMX",
    telefono: "+52 55 4160 0002",
    activa: true,
    personalCount: 1,
  },
];

const mockServicios = [
  {
    id: "serv-1",
    nombre: "Corte Clásico",
    duracion_minutos: 45,
    precio: 350,
    activo: true,
  },
  {
    id: "serv-2",
    nombre: "Afeitado Tradicional",
    duracion_minutos: 30,
    precio: 280,
    activo: true,
  },
];

const mockProfesionales = [
  {
    id: "prof-1",
    nombre: "Alejandro",
    apellido: "Vargas",
    sucursal_id: "suc-1",
    avatar_url: null,
    activo: true,
    serviciosIds: ["serv-1", "serv-2"],
  },
  {
    id: "prof-2",
    nombre: "Beatriz",
    apellido: "Luna",
    sucursal_id: "suc-1",
    avatar_url: null,
    activo: true,
    serviciosIds: ["serv-1"],
  },
];

function renderWithClient(
  element: React.ReactElement,
  options?: {
    profesionales?: typeof mockProfesionales;
    isLoading?: boolean;
  },
) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  client.setQueryData(["auth", "me"], {
    negocio: {
      id: "neg-1",
      nombre_comercial: "Barbería Elite",
      slug: "barberia-elite",
    },
  });

  client.setQueryData(["negocio", "sucursales"], {
    sucursales: mockSucursales,
  });

  client.setQueryData(["negocio", "servicios"], {
    servicios: mockServicios,
  });

  client.setQueryData(["negocio", "citas"], {
    citas: [],
  });

  if (options?.isLoading) {
    // Leave queries uninitialized to test loading
  } else {
    const profs =
      options?.profesionales !== undefined
        ? options.profesionales
        : mockProfesionales;

    client.setQueryData(["negocio", "profesionales", undefined], {
      profesionales: profs,
    });

    client.setQueryData(["cliente", "catalogo", "barberia-elite"], {
      data: {
        negocio: { id: "neg-1", slug: "barberia-elite" },
        sucursales: mockSucursales,
        servicios: mockServicios,
        profesionales: profs,
      },
    });
  }

  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>
      {element}
    </QueryClientProvider>,
  );
  client.clear();
  return html;
}

describe("Módulo de Personal y Horarios (/personal) — Tests de UI/UX", () => {
  it("debe renderizar el encabezado con tipografía Bricolage y botón para registrar colaborador", () => {
    const html = renderWithClient(<PersonalPage />);

    expect(html).toContain("Equipo &amp; Personal");
    expect(html).toContain("Gestiona los especialistas y colaboradores de tu negocio");
    expect(html).toContain("Registrar Colaborador");
  });

  it("debe renderizar el alternador de vistas tipo píldora con conteo de colaboradores", () => {
    const html = renderWithClient(<PersonalPage />);

    expect(html).toContain("role=\"tablist\"");
    expect(html).toContain("Directorio del Equipo");
    expect(html).toContain("Matriz de Horarios");
    expect(html).toContain("2"); // Conteo de 2 colaboradores
  });

  it("debe renderizar fichas de colaboradores con nombres, sede, especialidades y badges en el Directorio", () => {
    const html = renderWithClient(<PersonalPage initialTab="directorio" />);

    // Nombres
    expect(html).toContain("Alejandro Vargas");
    expect(html).toContain("Beatriz Luna");

    // Badges de estado y rol
    expect(html).toContain("Activo");
    expect(html).toContain("Especialista");

    // Sede asignada
    expect(html).toContain("Sucursal Central Polanco");

    // Especialidades asignadas
    expect(html).toContain("Corte Clásico");
    expect(html).toContain("(45m)");
    expect(html).toContain("Afeitado Tradicional");
    expect(html).toContain("(30m)");

    // Botón para ver horarios
    expect(html).toContain("Ver horarios");
  });

  it("debe renderizar la Matriz de Horarios con los 7 días de la semana y turnos en Space Mono", () => {
    const html = renderWithClient(<PersonalPage initialTab="horarios" />);

    // Encabezados de días
    expect(html).toContain("Turnos y Jornadas Semanales");
    expect(html).toContain("Lun");
    expect(html).toContain("Lunes");
    expect(html).toContain("Vie");
    expect(html).toContain("Viernes");
    expect(html).toContain("Sáb");
    expect(html).toContain("Dom");
    expect(html).toContain("Domingo");

    // Nombres en la tabla
    expect(html).toContain("Alejandro Vargas");
    expect(html).toContain("Beatriz Luna");

    // Franjas de turno en Space Mono
    expect(html).toContain("09:00");
    expect(html).toContain("18:00");

    // Día de descanso (Domingo)
    expect(html).toContain("Descanso");
  });

  it("debe mostrar el esqueleto de carga cuando los datos están en progreso", () => {
    const html = renderWithClient(<PersonalPage />, { isLoading: true });

    expect(html).toContain("animate-pulse");
    expect(html).toContain("data-testid=\"personal-loading\"");
  });

  it("debe mostrar el estado vacío con llamado a la acción cuando no hay colaboradores", () => {
    const html = renderWithClient(<PersonalPage />, { profesionales: [] });

    expect(html).toContain("Aún no tienes personal registrado");
    expect(html).toContain("Registrar primer colaborador");
  });

  it("debe renderizar botones de acción para editar y desactivar en cada tarjeta de colaborador", () => {
    const html = renderWithClient(<PersonalPage initialTab="directorio" />);

    expect(html).toContain("aria-label=\"Editar a Alejandro\"");
    expect(html).toContain("aria-label=\"Desactivar a Alejandro\"");
    expect(html).toContain("aria-label=\"Editar a Beatriz\"");
    expect(html).toContain("aria-label=\"Desactivar a Beatriz\"");
  });

  it("debe renderizar badge Inactivo cuando un colaborador está desactivado", () => {
    const html = renderWithClient(<PersonalPage initialTab="directorio" />, {
      profesionales: [
        {
          id: "prof-inactivo",
          nombre: "Mario",
          apellido: "Inactivo",
          sucursal_id: "suc-1",
          avatar_url: null,
          activo: false,
          serviciosIds: [],
        },
      ],
    });

    expect(html).toContain("Inactivo");
    expect(html).toContain("aria-label=\"Activar a Mario\"");
  });
});

