import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AgendasPage from "@/app/(negocio)/agendas/page";
import { CitaDetailDrawer } from "@/components/negocio/CitaDetailDrawer";
import type { Cita, Servicio, Sucursal, Profesional } from "@/lib/types";
import { getBusinessToday } from "@/lib/utils/business-date";

const today =
  getBusinessToday("America/Mexico_City") ??
  new Date().toISOString().slice(0, 10);

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
    fecha: today,
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
    fecha: today,
    hora_inicio: "12:30",
    hora_fin: "13:00",
    estado: "pendiente_pago",
    precio_total: 280,
    notas_cliente: null,
  },
];

const mockSucursales: Sucursal[] = [
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

const mockServicios: Servicio[] = [
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

const mockProfesionales: Profesional[] = [
  {
    id: "prof-1",
    nombre: "Carlos",
    apellido: "Méndez",
    sucursal_id: "suc-1",
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
      profesionales: mockProfesionales,
    },
  });

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
  it("renderiza el encabezado con Bricolage Grotesque y botón primario de cita manual", () => {
    const html = renderComponent(<AgendasPage />);

    expect(html).toContain("Calendario &amp; Agendas");
    expect(html).toContain("font-bricolage");
    expect(html).toContain("Agendar Cita Manual");
    expect(html).toContain("bg-grape");
  });

  it("renderiza la barra de navegación de fechas y alternador de las 3 vistas (Cronograma / Día, Semanal, Mes)", () => {
    const html = renderComponent(<AgendasPage />);

    // Navegación de fechas accesible
    expect(html).toContain("Hoy");
    expect(html).toContain('aria-label="Fecha anterior"');
    expect(html).toContain('aria-label="Fecha siguiente"');
    expect(html).toContain('aria-label="Seleccionar fecha específica"');

    // Alternador de las 3 vistas (§10)
    expect(html).toContain('role="tablist"');
    expect(html).toContain("Día (Cronograma)");
    expect(html).toContain("Semana");
    expect(html).toContain("Mes");
    expect(html).toContain("Próximamente");

    // Filtros
    expect(html).toContain("Todos los estados");
    expect(html).toContain("Todos los profesionales");
  });

  it("renderiza citas en vista de cronograma con folios y horas en Space Mono (font-mono), clientes y badges semánticos con dot", () => {
    const html = renderComponent(<AgendasPage />);

    // Folios y horas en Space Mono (font-mono, tabular-nums)
    expect(html).toContain("#AG-CITA-1");
    expect(html).toContain("#AG-CITA-7");
    expect(html).toContain("font-mono");
    expect(html).toContain("10:00");
    expect(html).toContain("12:30");

    // Datos del cliente en Bricolage Grotesque
    expect(html).toContain("Juan Pérez");
    expect(html).toContain("María González");

    // Badges semánticos oficiales con dot (§5.12)
    expect(html).toContain("CONFIRMADA");
    expect(html).toContain("PENDIENTE PAGO");
    expect(html).toContain("bg-success");
    expect(html).toContain("bg-warning");
    expect(html).toContain("rounded-full");
  });

  it("renderiza estado vacío con mensaje descriptivo y botón primario", () => {
    const html = renderComponent(<AgendasPage />, {
      citas: [],
    });

    expect(html).toContain("No hay citas programadas para este período");
    expect(html).toContain(
      "Las citas reservadas por clientes o agendadas desde recepción aparecerán aquí organizadas por horario.",
    );
    expect(html).toContain("Agendar Cita Manual");
    expect(html).toContain("bg-grape");
    expect(html).toContain("border-dashed");
    expect(html).toContain("AG-TICKET");
  });

  it("renderiza estado de carga con skeletons risográficos cuando está en progreso", () => {
    const html = renderComponent(<AgendasPage />, { isLoading: true });

    expect(html).toContain('data-testid="agenda-loading"');
    expect(html).toContain("skel-block");
    expect(html).toContain("skel-text");
  });
});

describe("Drawer de Detalle de Cita (apps/web/components/negocio/CitaDetailDrawer.tsx)", () => {
  it("renderiza dimensiones responsivas (§5.10) y animación slide-in de 250ms ease-out", () => {
    const html = renderComponent(
      <CitaDetailDrawer
        isOpen={true}
        onClose={() => {}}
        cita={mockCitas[0]}
        servicios={mockServicios}
        sucursales={mockSucursales}
        profesionales={mockProfesionales}
      />,
    );

    // Dimensiones responsivas: 420px en desktop, full-screen en móvil
    expect(html).toContain("w-full");
    expect(html).toContain("sm:w-[420px]");
    expect(html).toContain("max-w-full");
    expect(html).toContain("h-full");

    // Animación slide-in
    expect(html).toContain("transition-transform");
    expect(html).toContain("duration-250");
    expect(html).toContain("ease-out");
  });

  it("renderiza la ficha del cliente embebida con avatar, teléfono en Space Mono y acciones rápidas", () => {
    const html = renderComponent(
      <CitaDetailDrawer
        isOpen={true}
        onClose={() => {}}
        cita={mockCitas[0]}
        servicios={mockServicios}
        sucursales={mockSucursales}
        profesionales={mockProfesionales}
      />,
    );

    // Avatar con inicial en bg-grape-soft text-grape font-bricolage
    expect(html).toContain("bg-grape-soft");
    expect(html).toContain("text-grape");
    expect(html).toContain("font-bricolage");
    expect(html).toContain("J"); // Inicial de Juan

    // Nombre completo en font-bricolage font-bold text-text-primary
    expect(html).toContain("Juan Pérez");

    // Teléfono en Space Mono tabular-nums
    expect(html).toContain("font-mono");
    expect(html).toContain("tabular-nums");
    expect(html).toContain("+525512345678");

    // Botones de acción rápida: WhatsApp y Llamar
    expect(html).toContain("WhatsApp");
    expect(html).toContain("href=\"https://wa.me/525512345678\"");
    expect(html).toContain("Llamar");
    expect(html).toContain("href=\"tel:525512345678\"");

    // Etiqueta de cliente nuevo / recurrente
    expect(html).toContain("Cliente nuevo");
    expect(html).toContain("Historial resumido");
  });

  it("utiliza primitivas oficiales Badge y Button con ConfirmDialog conectado", () => {
    const html = renderComponent(
      <CitaDetailDrawer
        isOpen={true}
        onClose={() => {}}
        cita={mockCitas[0]}
        servicios={mockServicios}
        sucursales={mockSucursales}
        profesionales={mockProfesionales}
      />,
    );

    // Badge oficial de estado con dot (§5.12)
    expect(html).toContain("Confirmada");
    expect(html).toContain("bg-success-soft");
    expect(html).toContain("text-success");

    // Botón oficial Button variant="primary" para completar (§5.13)
    expect(html).toContain("Marcar completada");
    expect(html).toContain("bg-grape");

    // Botón oficial Button variant="destructive" para cancelar
    expect(html).toContain("Cancelar cita");
    expect(html).toContain("bg-danger");

    // Botón oficial Button variant="secondary" para guardar notas
    expect(html).toContain("Guardar notas");
  });
});
