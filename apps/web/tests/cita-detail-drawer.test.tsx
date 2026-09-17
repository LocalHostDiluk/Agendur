import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CitaDetailDrawer } from "@/components/negocio/CitaDetailDrawer";
import type { Cita, Servicio, Sucursal, Profesional } from "@/lib/types";

function renderWithQuery(element: React.ReactElement) {
  const client = new QueryClient();
  const html = renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client }, element)
  );
  client.clear();
  return html;
}

const mockCita: Cita = {
  id: "cita-998877",
  fecha: "2026-09-25",
  hora_inicio: "10:00",
  hora_fin: "10:45",
  estado: "pendiente_pago",
  servicio_id: "srv-corte",
  sucursal_id: "suc-roma",
  profesional_id: "prof-carlos",
  cliente_nombre: "Santiago",
  cliente_apellido: "Pérez",
  cliente_telefono: "5512345678",
  cliente_email: "santiago@ejemplo.com",
  precio_total: 450,
  notas_cliente: "Preferencia por corte con tijera y poco desvanecido.",
};

const mockServicios: Servicio[] = [
  {
    id: "srv-corte",
    nombre: "Corte y Estilizado",
    duracion_minutos: 45,
    precio: 450,
  },
];

const mockSucursales: Sucursal[] = [
  {
    id: "suc-roma",
    nombre: "Sucursal Roma Norte",
    direccion: "Colima 123",
    ciudad: "CDMX",
    telefono: "5587654321",
    activa: true,
  },
];

const mockProfesionales: Profesional[] = [
  {
    id: "prof-carlos",
    nombre: "Carlos",
    apellido: "Mendoza",
  },
];

describe("CitaDetailDrawer Component", () => {
  it("no renderiza nada cuando isOpen es false y no hay cita previa activa", () => {
    const html = renderWithQuery(
      <CitaDetailDrawer isOpen={false} onClose={() => {}} cita={null} />
    );
    expect(html).toBe("");
  });

  it("renderiza estructura completa, accesibilidad y tokens de diseño cuando isOpen es true", () => {
    const html = renderWithQuery(
      <CitaDetailDrawer
        isOpen={true}
        onClose={() => {}}
        cita={mockCita}
        servicios={mockServicios}
        sucursales={mockSucursales}
        profesionales={mockProfesionales}
      />
    );

    // 1. Accesibilidad
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="drawer-cita-title"');
    expect(html).toContain('aria-label="Cerrar detalle"');

    // 2. Tokens de diseño
    expect(html).toContain("bg-surface");
    expect(html).toContain("border-border");
    expect(html).toContain("font-bricolage");
    expect(html).toContain("font-mono");

    // 3. Encabezado y Folio Space Mono
    expect(html).toContain("#AG-CITA-9");
    expect(html).toContain("Detalle de Cita");

    // 4. Badge grande de estado pendiente_pago
    expect(html).toContain("Pendiente de pago");
    expect(html).toContain("bg-amber-500/10");
    expect(html).toContain("text-amber-600");

    // 5. Sección Cliente con enlaces directos
    expect(html).toContain("Santiago Pérez");
    expect(html).toContain("5512345678");
    expect(html).toContain('href="https://wa.me/525512345678"');
    expect(html).toContain("WhatsApp");
    expect(html).toContain('href="tel:5512345678"');
    expect(html).toContain("Llamar");
    expect(html).toContain('href="mailto:santiago@ejemplo.com"');

    // 6. Sección Servicio y Ticket
    expect(html).toContain("Corte y Estilizado");
    expect(html).toContain("45 min");
    expect(html).toContain("$450.00 MXN");
    expect(html).toContain("Carlos Mendoza");
    expect(html).toContain("Sucursal Roma Norte");
    expect(html).toContain("10:00 - 10:45");

    // 7. Notas internas
    expect(html).toContain("Notas Internas");
    expect(html).toContain("Preferencia por corte con tijera y poco desvanecido.");
    expect(html).toContain("Guardar notas");

    // 8. Botones de acción rápida: al ser pendiente_pago, debe ofrecer Confirmar cita y Cancelar cita
    expect(html).toContain("Confirmar cita");
    expect(html).toContain("bg-mint");
    expect(html).toContain("Cancelar cita");
    expect(html).toContain("text-danger");
  });

  it("renderiza botón 'Marcar completada' y badge confirmada cuando la cita está confirmada", () => {
    const citaConfirmada: Cita = {
      ...mockCita,
      estado: "confirmada",
    };

    const html = renderWithQuery(
      <CitaDetailDrawer
        isOpen={true}
        onClose={() => {}}
        cita={citaConfirmada}
        servicios={mockServicios}
      />
    );

    // Badge verde
    expect(html).toContain("Confirmada");
    expect(html).toContain("bg-mint-soft");
    expect(html).toContain("text-mint-dark");

    // Botón Marcar completada
    expect(html).toContain("Marcar completada");
    expect(html).toContain("bg-grape");
    expect(html).toContain("Cancelar cita");
  });

  it("renderiza badge cancelada y no muestra botón de cancelar cuando ya está cancelada", () => {
    const citaCancelada: Cita = {
      ...mockCita,
      estado: "cancelada",
    };

    const html = renderWithQuery(
      <CitaDetailDrawer
        isOpen={true}
        onClose={() => {}}
        cita={citaCancelada}
        servicios={mockServicios}
      />
    );

    // Badge rojo
    expect(html).toContain("Cancelada");
    expect(html).toContain("bg-danger/10");
    expect(html).toContain("text-danger");

    // Al no ser confirmada, permite reactivar con Confirmar cita, y NO muestra Cancelar cita
    expect(html).toContain("Confirmar cita");
    expect(html).not.toContain("Cancelar cita");
  });
});
