import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ConfiguracionPage from "@/app/(negocio)/configuracion/page";

const mockConfiguracion = {
  id: "neg-12345",
  nombreNegocio: "Barbería & Spa Vintage",
  slug: "barberia-vintage",
  logoUrl: null,
  giroComercial: "Barbería / Peluquería masculina",
  monedaPrincipal: "MXN",
  pais: "MX",
  zonaHoraria: "America/Mexico_City",
  telefonoClienteRequerido: true,
  emailClienteRequerido: true,
  notasClienteHabilitadas: true,
  politicaCancelacion: "Cancelaciones con al menos 24 horas de anticipación.",
  porcentajeAnticipo: 20,
  cobroAnticipoObligatorio: true,
};

const mockSuscripcionData = {
  data: {
    suscripcion: {
      id: "sub-123",
      negocio_id: "neg-12345",
      plan_nombre: "Plan Pro Multi-Sede",
      estado: "activa",
      limite_sucursales: 3,
      sucursales_usadas: 2,
    },
    sucursales_usadas: 2,
    sucursales_limite: 3,
  },
};

function renderWithClient(
  element: React.ReactElement,
  options?: {
    config?: typeof mockConfiguracion | null;
    isLoading?: boolean;
  },
) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  if (options?.isLoading) {
    // Sin datos en caché -> se evalúa como loading
  } else {
    client.setQueryData(["negocio", "configuracion"], {
      configuracion:
        options?.config !== undefined ? options.config : mockConfiguracion,
    });
    client.setQueryData(["negocio", "suscripcion"], mockSuscripcionData);
  }

  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>{element}</QueryClientProvider>,
  );
  client.clear();
  return html;
}

describe("Módulo de Configuración (/configuracion) — Tests de UI/UX", () => {
  it("debe renderizar el encabezado, botón de guardado y los selectores de pestañas", () => {
    const html = renderWithClient(<ConfiguracionPage />);

    expect(html).toContain("Configuración");
    expect(html).toContain("Administra los parámetros comerciales");
    expect(html).toContain("Guardar cambios");
    expect(html).toContain("Perfil Comercial");
    expect(html).toContain("Políticas y Reservas");
    expect(html).toContain("Plan y Suscripción");
  });

  it("debe renderizar los datos del Perfil Comercial con el slug en Space Mono y el enlace del portal", () => {
    const html = renderWithClient(<ConfiguracionPage initialTab="perfil" />);

    expect(html).toContain("Barbería &amp; Spa Vintage");
    expect(html).toContain("barberia-vintage");
    expect(html).toContain("agendur.com/reserva/");
    expect(html).toContain("Copiar enlace");
    expect(html).toContain("Abrir portal");
    expect(html).toContain("Moneda Comercial");
    expect(html).toContain("MXN ($) — Peso Mexicano");
    expect(html).toContain("Ciudad de México / Centro (GMT-6)");
  });

  it("debe renderizar la pestaña de Políticas y Reservas con anticipo, switches y política de cancelación", () => {
    const html = renderWithClient(<ConfiguracionPage initialTab="politicas" />);
    expect(html).toContain("Cobro de Anticipo / Depósito");
    expect(html).toContain("Exigir anticipo obligatorio en el portal público");
    expect(html).toContain("20%");
    expect(html).toContain("Preajustes rápidos:");
    expect(html).toContain("Datos Requeridos al Cliente");
    expect(html).toContain("Teléfono obligatorio");
    expect(html).toContain("Correo electrónico obligatorio");
    expect(html).toContain("Permitir notas y comentarios del cliente");
    expect(html).toContain("Política de Cancelación y Reembolsos");
    expect(html).toContain(
      "Cancelaciones con al menos 24 horas de anticipación.",
    );
  });

  it("debe renderizar la pestaña de Plan y Suscripción con capacidad de sedes y botón Stripe", () => {
    const html = renderWithClient(
      <ConfiguracionPage initialTab="suscripcion" />,
    );

    expect(html).toContain("Plan Pro Multi-Sede");
    expect(html).toContain("Activo");
    expect(html).toContain("Capacidad de sucursales:");
    expect(html).toContain("2 de 3 sedes");
    expect(html).toContain("Gestionar facturación y pagos");
    expect(html).toContain("Citas y reservas ilimitadas");
    expect(html).toContain("Recordatorios automáticos");
  });

  it("debe mostrar el esqueleto de carga cuando la consulta está en progreso", () => {
    const html = renderWithClient(<ConfiguracionPage />, { isLoading: true });

    expect(html).toContain("animate-pulse");
    expect(html).toContain('data-testid="config-loading"');
  });

  it("debe renderizar el banner accesible de error con botón de reintento si no se encuentra configuración", () => {
    const html = renderWithClient(<ConfiguracionPage />, { config: null });

    expect(html).toContain("No se pudo cargar la configuración");
    expect(html).toContain("Reintentar");
    expect(html).toContain('role="alert"');
  });
});
