import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModalNuevaSucursal } from "@/components/negocio/ModalNuevaSucursal";
import { ModalNuevoServicio } from "@/components/negocio/ModalNuevoServicio";
import { ModalNuevaCitaManual } from "@/components/negocio/ModalNuevaCitaManual";

function renderWithQuery(element: React.ReactElement) {
  const client = new QueryClient();
  const html = renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client }, element),
  );
  client.clear();
  return html;
}

describe("Modales de Negocio (ModalNuevaSucursal y ModalNuevoServicio)", () => {
  describe("ModalNuevaSucursal", () => {
    it("no renderiza nada en el DOM cuando isOpen es false", () => {
      const html = renderWithQuery(
        <ModalNuevaSucursal isOpen={false} onClose={() => {}} />,
      );
      expect(html).toBe("");
    });

    it("renderiza estructura accesible y tokens de diseño cuando isOpen es true", () => {
      const html = renderWithQuery(
        <ModalNuevaSucursal isOpen={true} onClose={() => {}} />,
      );

      // Accesibilidad
      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain('aria-labelledby="modal-nueva-sucursal-title"');
      expect(html).toContain('aria-label="Cerrar modal"');

      // Tokens de diseño: superficie, borde, tipografía
      expect(html).toContain("bg-surface");
      expect(html).toContain("border-border");
      expect(html).toContain("font-bricolage");
      expect(html).toContain("font-mono");
      expect(html).toContain("Nueva Sucursal");

      // Campos obligatorios y opcionales
      expect(html).toContain('id="sucursal-nombre"');
      expect(html).toContain('maxLength="120"');
      expect(html).toContain('id="sucursal-direccion"');
      expect(html).toContain('id="sucursal-ciudad"');
      expect(html).toContain('id="sucursal-telefono"');
      expect(html).toContain('inputMode="tel"');
      expect(html).toContain('id="sucursal-cp"');
      expect(html).toContain('id="sucursal-estado"');

      // Selector de zona horaria con opciones comunes
      expect(html).toContain('id="sucursal-tz"');
      expect(html).toContain("America/Mexico_City");
      expect(html).toContain("America/Monterrey");
      expect(html).toContain("America/Tijuana");
      expect(html).toContain("America/Bogota");
      expect(html).toContain("America/Santiago");
      expect(html).toContain("America/Buenos_Aires");

      // Botones de acción
      expect(html).toContain("Cancelar");
      expect(html).toContain("Crear Sucursal");
    });
  });

  describe("ModalNuevoServicio", () => {
    it("no renderiza nada en el DOM cuando isOpen es false", () => {
      const html = renderWithQuery(
        <ModalNuevoServicio isOpen={false} onClose={() => {}} />,
      );
      expect(html).toBe("");
    });

    it("renderiza estructura accesible, descripción y presets de duración", () => {
      const html = renderWithQuery(
        <ModalNuevoServicio isOpen={true} onClose={() => {}} />,
      );

      // Accesibilidad
      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain('aria-labelledby="modal-nuevo-servicio-title"');
      expect(html).toContain('aria-label="Cerrar modal"');

      // Tokens y encabezado
      expect(html).toContain("bg-surface");
      expect(html).toContain("border-border");
      expect(html).toContain("font-bricolage");
      expect(html).toContain("Nuevo Servicio");
      expect(html).toContain(
        "Configura el servicio que tus clientes podrán reservar.",
      );

      // Campos
      expect(html).toContain('id="servicio-nombre"');
      expect(html).toContain('id="servicio-descripcion"');
      expect(html).toContain('maxLength="200"');
      expect(html).toContain("/200");

      // Presets de duración
      expect(html).toContain("15 min");
      expect(html).toContain("30 min");
      expect(html).toContain("45 min");
      expect(html).toContain("60 min");
      expect(html).toContain("90 min");
      expect(html).toContain("120 min");
      expect(html).toContain('id="servicio-duracion"');

      // Precio en MXN con prefijo $ y sufijo MXN en Space Mono
      expect(html).toContain('id="servicio-precio"');
      expect(html).toContain("$");
      expect(html).toContain("MXN");

      // Botón submit
      expect(html).toContain("Guardar Servicio");
    });
  });

  describe("ModalNuevaCitaManual", () => {
    const mockSucursales = [
      {
        id: "suc-1",
        nombre: "Sucursal Polanco",
        es_matriz: true,
        direccion: "Av. Horacio 123",
        ciudad: "CDMX",
        telefono: "+525511223344",
        activa: true,
      },
      {
        id: "suc-2",
        nombre: "Sucursal Condesa",
        es_matriz: false,
        direccion: "Amsterdam 45",
        ciudad: "CDMX",
        telefono: "+525599887766",
        activa: true,
      },
    ];

    const mockServicios = [
      {
        id: "serv-1",
        nombre: "Corte Clásico",
        duracion_minutos: 45,
        precio: 350,
        moneda: "MXN",
        activo: true,
      },
      {
        id: "serv-2",
        nombre: "Barba Tradicional",
        duracion_minutos: 30,
        precio: 250,
        moneda: "MXN",
        activo: true,
      },
    ];

    it("no renderiza nada en el DOM cuando isOpen es false", () => {
      const html = renderWithQuery(
        <ModalNuevaCitaManual
          isOpen={false}
          onClose={() => {}}
          sucursales={mockSucursales}
          servicios={mockServicios}
        />,
      );
      expect(html).toBe("");
    });

    it("renderiza estructura accesible y tokens de diseño cuando isOpen es true", () => {
      const html = renderWithQuery(
        <ModalNuevaCitaManual
          isOpen={true}
          onClose={() => {}}
          initialFecha="2026-09-20"
          sucursales={mockSucursales}
          servicios={mockServicios}
        />,
      );

      // Accesibilidad
      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain('aria-labelledby="modal-manual-title"');
      expect(html).toContain('aria-label="Cerrar modal"');

      // Tokens y tipografías
      expect(html).toContain("bg-surface");
      expect(html).toContain("border-border");
      expect(html).toContain("font-bricolage");
      expect(html).toContain("font-mono");
      expect(html).toContain("text-mint");
      expect(html).toContain("bg-grape");

      // Encabezado
      expect(html).toContain("Agendar Cita Manual");
      expect(html).toContain(
        "Registra una cita directa para clientes presenciales o vía telefónica.",
      );
      expect(html).toContain("Recepción directa");

      // Selectores de Sucursal y Servicio
      expect(html).toContain('id="manual-sucursal"');
      expect(html).toContain("Sucursal Polanco (Matriz)");
      expect(html).toContain('id="manual-servicio"');
      expect(html).toContain("Corte Clásico — 45 min — $350 MXN");

      // Fecha y Hora
      expect(html).toContain('id="manual-fecha"');
      expect(html).toContain('value="2026-09-20"');
      expect(html).toContain('id="manual-hora"');
      expect(html).toContain("08:00 hrs");
      expect(html).toContain("19:30 hrs");

      // Datos de cliente y notas
      expect(html).toContain('id="manual-cliente-nombre"');
      expect(html).toContain('id="manual-cliente-apellido"');
      expect(html).toContain('id="manual-cliente-telefono"');
      expect(html).toContain('inputMode="tel"');
      expect(html).toContain('id="manual-cliente-email"');
      expect(html).toContain('inputMode="email"');
      expect(html).toContain('id="manual-cliente-notas"');

      // Botón de acción
      expect(html).toContain("Cancelar");
      expect(html).toContain("Agendar Cita");
    });
  });
});

