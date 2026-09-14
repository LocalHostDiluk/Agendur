import { expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BookingPortal } from "@/components/cliente/BookingPortal";

test("el portal usa la configuración real y no muestra opciones de demostración", () => {
  const client = new QueryClient();
  client.setQueryData(["cliente", "catalogo", "negocio-real"], {
    data: {
      negocio: {
        id: "neg-real",
        nombre_comercial: "Negocio real",
        moneda_principal: "MXN",
        telefono_cliente_requerido: false,
        email_cliente_requerido: true,
        notas_cliente_habilitadas: false,
        politica_cancelacion: "Cancelar con anticipación.",
      },
      sucursales: [{ id: "sucursal-real", nombre: "Centro", direccion: "Calle Uno" }],
      servicios: [{ id: "servicio-real", nombre: "Corte", duracion_minutos: 30, precio: 250 }],
      profesionales: [{ id: "profesional-real", sucursal_id: "sucursal-real", nombre: "Ana", apellido: "Pérez", serviciosIds: ["servicio-real"] }],
    },
  });

  const html = renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client }, React.createElement(BookingPortal, { negocioSlug: "negocio-real" })),
  );

  expect(html).toContain("Negocio real");
  expect(html).toContain("sucursal-real");
  expect(html).toContain("servicio-real");
  expect(html).toContain("Cancelar con anticipación.");
  expect(html).toMatch(/id="reserva-email"[^>]*required/);
  expect(html).not.toMatch(/id="reserva-telefono"[^>]*required/);
  expect(html).not.toContain("reserva-notas");
  expect(html).not.toContain("cliente@ejemplo.com");
  expect(html).not.toContain("Recordatorio enviado");
});
