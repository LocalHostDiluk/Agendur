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
    profesionales?: Array<(typeof mockProfesionales)[number] & { cargo?: string; telefono?: string }>;
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

  it("debe renderizar roles con Badge de diseño (Administrador, Especialista, Recepcionista)", () => {
    const html = renderWithClient(<PersonalPage initialTab="directorio" />, {
      profesionales: [
        {
          id: "prof-admin",
          nombre: "Laura",
          apellido: "Gerente",
          sucursal_id: "suc-1",
          avatar_url: null,
          activo: true,
          cargo: "Administrador",
          serviciosIds: [],
        },
        {
          id: "prof-recep",
          nombre: "Diana",
          apellido: "Recepción",
          sucursal_id: "suc-1",
          avatar_url: null,
          activo: true,
          cargo: "Recepcionista",
          serviciosIds: [],
        },
      ],
    });

    expect(html).toContain("Administrador");
    expect(html).toContain("Recepcionista");
    // Badge variant class checks
    expect(html).toContain("text-grape bg-grape-soft"); // Administrador / grape
  });

  it("debe renderizar el modal de Roles y Permisos con PendingBadge para permisos en desarrollo (§10)", () => {
    const html = renderWithClient(
      <PersonalPage initialPermisosOpen={true} />
    );

    expect(html).toContain("Roles y Permisos del Personal");
    expect(html).toContain("Gestión de Permisos Granulares");
    expect(html).toContain("Pendiente");
    expect(html).toContain("Gestión avanzada de permisos en desarrollo");
  });

  it("debe transformar la vista en mobile (<640px) como tarjetas limpias apiladas (§8)", () => {
    const html = renderWithClient(<PersonalPage initialTab="directorio" />);

    // Contenedor mobile específico
    expect(html).toContain('data-testid="colaboradores-mobile-list"');
    expect(html).toContain("sm:hidden");
    // Tabla para desktop
    expect(html).toContain("hidden sm:block");
  });

  it("debe formatear teléfonos en Space Mono (font-mono tabular-nums)", () => {
    const html = renderWithClient(<PersonalPage initialTab="directorio" />, {
      profesionales: [
        {
          id: "prof-tel",
          nombre: "Carlos",
          apellido: "Teléfono",
          sucursal_id: "suc-1",
          avatar_url: null,
          activo: true,
          telefono: "+52 55 1234 5678",
          serviciosIds: [],
        },
      ],
    });

    expect(html).toContain("+52 55 1234 5678");
    expect(html).toContain("font-mono tabular-nums");
  });

  it("debe renderizar el botón para eliminar colaborador con aria-label para Confirmación Nivel 2 (§5.11)", () => {
    const html = renderWithClient(<PersonalPage initialTab="directorio" />);

    expect(html).toContain('aria-label="Eliminar a Alejandro"');
    expect(html).toContain('aria-label="Eliminar a Beatriz"');
  });
});


