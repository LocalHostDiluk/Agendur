import { describe, expect, it, mock } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock next/navigation
mock.module("next/navigation", () => ({
  useRouter: () => ({ push: mock(), replace: mock(), refresh: mock() }),
  usePathname: () => "/configuracion",
}));

import ConfiguracionPage from "@/app/(negocio)/configuracion/page";
import PagosPage from "@/app/(negocio)/pagos/page";
import ReportesPage from "@/app/(negocio)/reportes/page";

const mockAuthMe = {
  user: { id: "user-owner-1", email: "admin@estudiospa.com" },
  perfil: {
    nombres: "Ana",
    apellidos: "López",
    telefono: "+528112345678",
    locale: "es-MX",
  },
  negocio: {
    id: "neg-spa-1",
    nombre_comercial: "Studio Spa & Belleza",
    slug: "studio-spa",
    giro_comercial: "Spa / Masajes y bienestar",
    zona_horaria: "America/Mexico_City",
  },
  onboardingStatus: "complete",
  sucursalesCount: 2,
  access: {
    role: "owner",
    sucursalId: null,
    profesionalId: null,
    capabilities: ["config:read", "config:write", "billing:read", "billing:write"],
  },
  suscripcion: {
    plan_nombre: "Plan Pro Multi-Sede",
    estado: "activa",
    intervalo: "mensual",
    limite_sucursales: 3,
  },
};

const mockConfiguracion = {
  id: "cfg-12345",
  nombreNegocio: "Studio Spa & Belleza",
  slug: "studio-spa",
  logoUrl: null,
  giroComercial: "Spa / Masajes y bienestar",
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

const mockSuscripcion = {
  data: {
    suscripcion: {
      id: "sub-123",
      negocio_id: "neg-spa-1",
      plan_nombre: "Plan Pro Multi-Sede",
      estado: "activa",
      limite_sucursales: 3,
      sucursales_usadas: 2,
    },
    sucursales_usadas: 2,
    sucursales_limite: 3,
  },
};

const mockSucursales = {
  sucursales: [
    {
      id: "suc-1",
      nombre: "Sucursal Matriz Centro",
      direccion: "Av. Hidalgo 123",
      ciudad: "Monterrey",
      telefono: "+528112345678",
      es_matriz: true,
    },
    {
      id: "suc-2",
      nombre: "Sucursal Providencia",
      direccion: "Av. Providencia 456",
      ciudad: "Guadalajara",
      telefono: "+523312345678",
      es_matriz: false,
    },
  ],
};

function renderWithClient(
  element: React.ReactElement,
  options?: {
    config?: typeof mockConfiguracion | null;
    auth?: typeof mockAuthMe | null;
    suscripcion?: typeof mockSuscripcion | null;
    sucursales?: typeof mockSucursales | null;
  }
) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  if (options?.auth !== undefined) {
    client.setQueryData(["auth", "me"], options.auth);
  } else {
    client.setQueryData(["auth", "me"], mockAuthMe);
  }

  if (options?.config !== undefined) {
    client.setQueryData(["negocio", "configuracion"], {
      configuracion: options.config,
    });
  } else {
    client.setQueryData(["negocio", "configuracion"], {
      configuracion: mockConfiguracion,
    });
  }

  if (options?.suscripcion !== undefined) {
    client.setQueryData(["negocio", "suscripcion"], options.suscripcion);
  } else {
    client.setQueryData(["negocio", "suscripcion"], mockSuscripcion);
  }

  if (options?.sucursales !== undefined) {
    client.setQueryData(["negocio", "sucursales"], options.sucursales);
  } else {
    client.setQueryData(["negocio", "sucursales"], mockSucursales);
  }

  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>{element}</QueryClientProvider>
  );
  client.clear();
  return html;
}

describe("Suite de Vistas Extendidas & Auditoría de Consistencia Global — Fase 6 (Design System §5, §6, §10, §11)", () => {
  // =========================================================================
  // 1. MÓDULO DE CONFIGURACIÓN (/configuracion)
  // =========================================================================
  describe("Configuración (/configuracion)", () => {
    it("renderiza las pestañas canónicas (§10): Perfil, Políticas, Usuarios y roles, Plantillas de recordatorios, Plan y facturación", () => {
      const html = renderWithClient(<ConfiguracionPage />);

      // Pestaña 1: Perfil
      expect(html).toContain("Perfil");
      expect(html).toContain("Perfil Comercial");

      // Pestaña 2: Políticas
      expect(html).toContain("Políticas");
      expect(html).toContain("Políticas y Reservas");

      // Pestaña 3: Usuarios y roles
      expect(html).toContain("Usuarios y roles");

      // Pestaña 4: Plantillas de recordatorios
      expect(html).toContain("Plantillas de recordatorios");

      // Pestaña 5: Plan y facturación
      expect(html).toContain("Plan y facturación");
    });

    it("la pestaña de Plan/Suscripción incluye la tarjeta de plan con muesca semicircular autorizada en esquina (§5.6.4)", () => {
      const html = renderWithClient(
        <ConfiguracionPage initialTab="suscripcion" />
      );

      // Muesca semicircular autorizada en esquina superior derecha
      expect(html).toContain(
        "absolute -top-3 -right-3 w-6 h-6 rounded-full bg-background border border-border"
      );

      // Datos de la suscripción
      expect(html).toContain("Plan Pro Multi-Sede");
      expect(html).toContain("Activo");
      expect(html).toContain("Capacidad de sucursales:");
      expect(html).toContain("Gestionar facturación y pagos");
      expect(html).toContain("Citas y reservas ilimitadas");
    });

    it("la pestaña de Plantillas incluye el preview de ticket y PendingBadge", () => {
      const html = renderWithClient(
        <ConfiguracionPage initialTab="plantillas" />
      );

      // Título y contexto de plantillas
      expect(html).toContain("Plantillas de Notificaciones");
      expect(html).toContain("WhatsApp");
      expect(html).toContain("SMS");

      // Preview interactivo de ticket risográfico con folio y perforación (§5.6)
      expect(html).toContain("Vista Previa del Cliente");
      expect(html).toContain("#TK-4820");
      expect(html).toContain("border-dashed border-border");
      expect(html).toContain("w-5 h-5 rounded-full bg-background border border-border");

      // Badge de estado pendiente / beta
      expect(html).toContain("border-dashed border-amber-500/30");
      expect(html).toContain("bg-amber-500/10");
      expect(html).toContain("Beta");
    });

    it("la pestaña de Usuarios y roles renderiza tabla accesible sin clases uppercase forzadas", () => {
      const html = renderWithClient(
        <ConfiguracionPage initialTab="usuarios" />
      );

      expect(html).toContain("Usuarios y roles");
      expect(html).toContain("Invitar usuario");
      expect(html).toContain("Usuario o colaborador");
      expect(html).toContain("Rol asignado");

      // Verificación de no uppercase en encabezados de tabla de equipo
      expect(html).not.toContain("uppercase tracking-wider");
    });
  });

  // =========================================================================
  // 2. MÓDULO DE PAGOS (/pagos)
  // =========================================================================
  describe("Pagos y Facturación (/pagos)", () => {
    it("renderiza las 3 KPI cards de pagos con números en Space Mono 32px (font-mono tabular-nums)", () => {
      const html = renderWithClient(<PagosPage />);

      // Card 1 destacada con fondo grape suave (§5.3 jerarquía obligatoria)
      expect(html).toContain("Total Ingresos del Mes");
      expect(html).toContain("bg-grape-soft/40");
      expect(html).toContain("$48,250.00 MXN");

      // Card 2: Anticipos recaudados
      expect(html).toContain("Anticipos Recaudados");
      expect(html).toContain("$14,800.00 MXN");

      // Card 3: Pagos pendientes
      expect(html).toContain("Pagos Pendientes");
      expect(html).toContain("$5,600.00 MXN");

      // Tipografía numérica Space Mono 32px fija para alineación contable
      expect(html).toContain(
        "font-mono text-[32px] tabular-nums font-bold text-text-primary tracking-tight"
      );
    });

    it("renderiza la tabla de transacciones con folios #TX- y badges semánticos con dot (Badge)", () => {
      const html = renderWithClient(<PagosPage />);

      // Folios con prefijo #TX- en tipografía mono
      expect(html).toContain("#TX-9481");
      expect(html).toContain("#TX-9480");
      expect(html).toContain("#TX-9479");
      expect(html).toContain("font-mono text-xs font-bold text-grape");

      // Badges semánticos con punto integrado (dot indicator §5.12)
      expect(html).toContain("w-1.5 h-1.5 rounded-full shrink-0 bg-success");
      expect(html).toContain("Pagado");
      expect(html).toContain("w-1.5 h-1.5 rounded-full shrink-0 bg-warning");
      expect(html).toContain("Pendiente");
      expect(html).toContain("w-1.5 h-1.5 rounded-full shrink-0 bg-danger");
      expect(html).toContain("Reembolsado");

      // Encabezados de tabla en sentence case (§3 y §11)
      expect(html).toContain("ID Transacción");
      expect(html).toContain("Fecha &amp; Hora");
      expect(html).toContain("Cliente");
      expect(html).toContain("Servicio &amp; Sede");
      expect(html).toContain("Método");
      expect(html).toContain("Monto");
      expect(html).toContain("Estado");
      expect(html).toContain("Recibo");
    });

    it("renderiza el banner informativo con PendingBadge ('Datos Simulados')", () => {
      const html = renderWithClient(<PagosPage />);

      // Banner informativo con PendingBadge
      expect(html).toContain("Datos Simulados");
      expect(html).toContain("Módulo Visual Preliminar de Transacciones");
      expect(html).toContain("border-dashed border-amber-500/30");
      expect(html).toContain("bg-amber-500/5");
      expect(html).toContain("Stripe Connect Activo");
    });

    it("renderiza el botón de exportación deshabilitado con PendingBadge", () => {
      const html = renderWithClient(<PagosPage />);

      expect(html).toContain("Exportar transacciones");
      expect(html).toContain("Pendiente");
    });
  });

  // =========================================================================
  // 3. MÓDULO DE REPORTES (/reportes)
  // =========================================================================
  describe("Reportes y Analítica (/reportes)", () => {
    it("renderiza el encabezado con tipografía Bricolage Grotesque", () => {
      const html = renderWithClient(<ReportesPage />);

      expect(html).toContain("font-bricolage font-bold");
      expect(html).toContain("Reportes y Analítica");
      expect(html).toContain(
        "Visualiza métricas operativas clave, rendimiento de sucursales y demanda de servicios."
      );
    });

    it("renderiza métricas resumen en Space Mono 32px tabular-nums", () => {
      const html = renderWithClient(<ReportesPage />);

      // Métricas KPI
      expect(html).toContain("Tasa de ocupación promedio");
      expect(html).toContain("78.4%");
      expect(html).toContain("Citas completadas");
      expect(html).toContain("142");
      expect(html).toContain("Ticket promedio");
      expect(html).toContain("$420.00 MXN");

      // Cifra con estilo canónico de Space Mono 32px
      expect(html).toContain(
        "font-mono text-[32px] tabular-nums font-bold text-text-primary tracking-tight"
      );
    });

    it("renderiza botones de rango de fecha y botón de exportación marcado con PendingBadge", () => {
      const html = renderWithClient(<ReportesPage />);

      // Filtros rápidos de rango
      expect(html).toContain("Últimos 7 días");
      expect(html).toContain("Últimos 30 días");
      expect(html).toContain("Este mes");

      // Botón de exportar reporte con PendingBadge
      expect(html).toContain("Exportar reporte");
      expect(html).toContain("Pendiente");
      expect(html).toContain("border-dashed border-amber-500/30");
    });

    it("renderiza las 3 secciones de gráficas Recharts con tokens oficiales (§6)", () => {
      const html = renderWithClient(<ReportesPage />);

      // Gráfica 1: Ocupación por Sucursal (BarChart)
      expect(html).toContain("Ocupación por Sucursal");
      expect(html).toContain("Porcentaje de utilización de sillones y consultorios.");

      // Gráfica 2: Servicios Más Solicitados (Donut PieChart)
      expect(html).toContain("Servicios Más Solicitados");
      expect(html).toContain("Distribución porcentual sobre el total de citas atendidas.");

      // Gráfica 3: Tasa de Inasistencias (AreaChart)
      expect(html).toContain("Tasa de Inasistencias");
      expect(html).toContain("Seguimiento porcentual de citas no asistidas o canceladas sin previo aviso (§6).");

      // Verificación de presencia de contenedores Recharts
      expect(html).toContain("recharts-responsive-container");
      const matchContainers = html.match(/recharts-responsive-container/g);
      expect(matchContainers?.length).toBe(3);
    });
  });

  // =========================================================================
  // 4. AUDITORÍA DE CONSISTENCIA VISUAL & ACCESIBILIDAD (§11)
  // =========================================================================
  describe("Auditoría de Consistencia Visual (§11)", () => {
    it("revisa que todos los botones usen Button de UI Kit con scale-[0.98] y radio --radius-md", () => {
      const configuracionHtml = renderWithClient(<ConfiguracionPage />);
      const pagosHtml = renderWithClient(<PagosPage />);
      const reportesHtml = renderWithClient(<ReportesPage />);

      // Botones con radio --radius-md y scale 0.98 al presionar (§5.13)
      expect(configuracionHtml).toContain("rounded-[var(--radius-md)]");
      expect(configuracionHtml).toContain("active:scale-[0.98]");

      expect(pagosHtml).toContain("rounded-[var(--radius-md)]");
      expect(pagosHtml).toContain("active:scale-[0.98]");

      expect(reportesHtml).toContain("rounded-[var(--radius-md)]");
      expect(reportesHtml).toContain("active:scale-[0.98]");

      // Ausencia de estilos anticuados o no permitidos
      expect(configuracionHtml).not.toContain("bg-blue-600");
      expect(pagosHtml).not.toContain("bg-blue-600");
      expect(reportesHtml).not.toContain("bg-blue-600");
    });

    it("que ningún botón o tabla tenga clases forzadas uppercase excepto folios y Space Mono", () => {
      const pagosHtml = renderWithClient(<PagosPage />);
      const configuracionHtml = renderWithClient(<ConfiguracionPage initialTab="usuarios" />);
      const reportesHtml = renderWithClient(<ReportesPage />);

      // Las cabeceras de tabla deben ser en sentence case
      expect(pagosHtml).not.toContain("<thead><tr className=\"uppercase\"");
      expect(configuracionHtml).not.toContain("<thead><tr className=\"uppercase\"");

      // Los botones no deben tener uppercase forzado
      expect(pagosHtml).not.toContain("<button className=\"uppercase");
      expect(reportesHtml).not.toContain("<button className=\"uppercase");
    });

    it("que los badges de estado tengan punto semántico integrado (dot indicator)", () => {
      const pagosHtml = renderWithClient(<PagosPage />);

      // Dot integrado en badges de estado de pagos
      expect(pagosHtml).toContain("w-1.5 h-1.5 rounded-full shrink-0 bg-success");
      expect(pagosHtml).toContain("w-1.5 h-1.5 rounded-full shrink-0 bg-warning");
      expect(pagosHtml).toContain("w-1.5 h-1.5 rounded-full shrink-0 bg-danger");
    });

    it("que los motivos de ticket risográfico estén estrictamente restringidos a los 4 casos autorizados (§5.6)", () => {
      const configuracionPlanHtml = renderWithClient(
        <ConfiguracionPage initialTab="suscripcion" />
      );
      const configuracionPlantillasHtml = renderWithClient(
        <ConfiguracionPage initialTab="plantillas" />
      );
      const pagosHtml = renderWithClient(<PagosPage />);

      // Caso autorizado 4: Muesca semicircular en tarjeta de upgrade/plan (§5.6.4)
      expect(configuracionPlanHtml).toContain(
        "absolute -top-3 -right-3 w-6 h-6 rounded-full bg-background border border-border"
      );

      // Caso autorizado: Preview de ticket de recordatorios
      expect(configuracionPlantillasHtml).toContain("#TK-4820");

      // La tabla de pagos NO debe tener muescas ni perforaciones decorativas
      expect(pagosHtml).not.toContain("muesca-ticket");
    });
  });
});
