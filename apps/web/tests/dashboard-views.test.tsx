import { describe, expect, it, mock } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

mock.module("next/navigation", () => ({
  useRouter: () => ({ push: mock(), replace: mock(), refresh: mock() }),
  usePathname: () => "/dashboard",
}));

import DashboardPage from "@/app/(negocio)/dashboard/page";
import OnboardingPage from "@/app/(negocio)/onboarding/page";

const activeOwner = {
  user: { id: "owner-1", email: "ana@example.com" },
  perfil: {
    nombres: "Ana",
    apellidos: "López",
    telefono: "+528112345678",
    locale: "es-MX",
  },
  negocio: {
    id: "neg-1",
    nombre_comercial: "Studio Spa",
    slug: "studio-spa",
    giro_comercial: "Belleza y Spa",
    zona_horaria: "America/Mexico_City",
  },
  onboardingStatus: "complete",
  sucursalesCount: 1,
  suscripcion: {
    plan_nombre: "Pro",
    estado: "active",
    intervalo: "mensual",
    limite_sucursales: 3,
  },
};

const activeBranches = [
  {
    id: "branch-1",
    nombre: "Sucursal Centro",
    direccion: "Av. Hidalgo 123",
    ciudad: "Monterrey",
    telefono: "+528112345678",
  },
];

const activeConfig = {
  configuracion: {
    nombreNegocio: "Studio Spa",
    giroComercial: "Belleza y Spa",
    pais: "MX",
  },
};

const activeSubscription = {
  data: {
    suscripcion: {
      plan_nombre: "Pro",
      estado: "active",
      intervalo: "mensual",
      limite_sucursales: 3,
    },
    sucursales_usadas: 1,
    sucursales_limite: 3,
  },
};

const activeCitas = {
  citas: [
    {
      id: "cita-1",
      cliente_nombre: "Carlos",
      cliente_apellido: "García",
      cliente_telefono: "+528111223344",
      sucursal_id: "Sucursal Centro",
      servicio_id: "Corte y Masaje",
      fecha: new Date().toISOString().split("T")[0],
      hora_inicio: "10:00",
      precio_total: 450,
      estado: "confirmada",
    },
    {
      id: "cita-2",
      cliente_nombre: "María",
      cliente_apellido: "Santos",
      cliente_telefono: "+528199887766",
      sucursal_id: "Sucursal Centro",
      servicio_id: "Facial Premium",
      fecha: new Date().toISOString().split("T")[0],
      hora_inicio: "12:00",
      precio_total: 800,
      estado: "pendiente_pago",
    },
    {
      id: "cita-3",
      cliente_nombre: "Luis",
      cliente_apellido: "Mendoza",
      cliente_telefono: "+528122334455",
      sucursal_id: "Sucursal Centro",
      servicio_id: "Manicura Spa",
      fecha: "2026-09-01",
      hora_inicio: "15:00",
      precio_total: 350,
      estado: "cancelada",
    },
  ],
};

const newOwnerOnboarding = {
  user: { id: "owner-2", email: "pedro@example.com" },
  perfil: { nombres: "Pedro", apellidos: "Ramírez", telefono: null, locale: "es-MX" },
  negocio: {
    id: "neg-2",
    nombre_comercial: "Barbería Elite",
    slug: "barberia-elite",
    giro_comercial: "Barbería",
    pais: "MX",
  },
  onboardingStatus: "required",
  sucursalesCount: 0,
  suscripcion: null,
};

function renderWithClient(
  element: React.ReactElement,
  data?: {
    auth?: Record<string, unknown> | null;
    branches?: Array<Record<string, unknown>>;
    config?: Record<string, unknown>;
    subscription?: Record<string, unknown>;
    citas?: Record<string, unknown>;
  }
) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  if (data?.auth !== undefined) {
    client.setQueryData(["auth", "me"], data.auth);
  }
  if (data?.branches !== undefined) {
    client.setQueryData(["negocio", "sucursales"], { sucursales: data.branches });
  } else {
    client.setQueryData(["negocio", "sucursales"], { sucursales: [] });
  }
  if (data?.config !== undefined) {
    client.setQueryData(["negocio", "configuracion"], data.config);
  } else {
    client.setQueryData(["negocio", "configuracion"], {
      configuracion: { nombreNegocio: "Barbería Elite", giroComercial: "Barbería", pais: "MX" },
    });
  }
  if (data?.subscription !== undefined) {
    client.setQueryData(["negocio", "suscripcion"], data.subscription);
  }
  if (data?.citas !== undefined) {
    client.setQueryData(["negocio", "citas"], data.citas);
  }

  const html = renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client }, element)
  );
  client.clear();
  return html;
}

describe("Dashboard Views & Onboarding Brand Polish (Fase 3 — Design System §5.3, §5.6.1, §5.13)", () => {
  describe("DashboardPage (/dashboard)", () => {
    it("renderiza las 4 KPI cards con jerarquía de §5.3 (Citas para Hoy destacada con bg-grape-soft, Ingresos del Mes, Tasa de Ocupación, Inasistencias)", () => {
      const html = renderWithClient(React.createElement(DashboardPage), {
        auth: activeOwner,
        branches: activeBranches,
        config: activeConfig,
        subscription: activeSubscription,
        citas: activeCitas,
      });

      // Card 1 destacada con fondo grape suave
      expect(html).toContain("Citas para hoy");
      expect(html).toContain("bg-grape-soft");

      // Card 2: Ingresos del mes
      expect(html).toContain("Ingresos del mes");

      // Card 3: Tasa de ocupación
      expect(html).toContain("Tasa de ocupación");

      // Card 4: Tasa de inasistencias
      expect(html).toContain("Tasa de inasistencias");
    });

    it("los valores numéricos clave usan font-mono y tabular-nums (Space Mono)", () => {
      const html = renderWithClient(React.createElement(DashboardPage), {
        auth: activeOwner,
        branches: activeBranches,
        config: activeConfig,
        subscription: activeSubscription,
        citas: activeCitas,
      });

      // Las métricas numéricas principales deben usar tipografía Space Mono de ancho fijo
      expect(html).toContain("font-mono text-[32px] font-bold tabular-nums");
    });

    it("renderiza badges semánticos con punto integrado (dot indicator)", () => {
      const html = renderWithClient(React.createElement(DashboardPage), {
        auth: activeOwner,
        branches: activeBranches,
        config: activeConfig,
        subscription: activeSubscription,
        citas: activeCitas,
      });

      // Punto semántico requerido según §5.12
      expect(html).toContain("w-1.5 h-1.5 rounded-full");
      expect(html).toContain("bg-success");
    });

    it("renderiza badges PendingBadge en filtros y acciones simuladas", () => {
      const html = renderWithClient(React.createElement(DashboardPage), {
        auth: activeOwner,
        branches: activeBranches,
        config: activeConfig,
        subscription: activeSubscription,
        citas: activeCitas,
      });

      // PendingBadge para filtro personalizado
      expect(html).toContain("Próximamente");
      expect(html).toContain('title="Filtro de fecha personalizado en desarrollo"');

      // PendingBadge para exportación de reportes
      expect(html).toContain("Exportar reporte");
      expect(html).toContain("Pendiente");
      expect(html).toContain('title="Exportación de reportes en preparación"');

      // Estilo característico de PendingBadge (borde dashed y fondo ambarino)
      expect(html).toContain("border border-dashed border-amber-500/30");
      expect(html).toContain("bg-amber-500/10");
    });

    it("renderiza la tarjeta con muesca autorizada (§5.6.4)", () => {
      const html = renderWithClient(React.createElement(DashboardPage), {
        auth: activeOwner,
        branches: activeBranches,
        config: activeConfig,
        subscription: activeSubscription,
        citas: activeCitas,
      });

      // Muesca semicircular autorizada en esquina superior derecha de la tarjeta de suscripción/upgrade
      expect(html).toContain(
        "absolute -top-3 -right-3 w-6 h-6 rounded-full bg-background border border-border"
      );
      expect(html).toContain("SUSCRIPCIÓN AGENDUR");
      expect(html).toContain("Mejorar plan o gestionar");
    });
  });

  describe("OnboardingPage (/onboarding)", () => {
    it("no contiene clases obsoletas bg-blue-600 ni text-slate-900", () => {
      const html = renderWithClient(React.createElement(OnboardingPage), {
        auth: newOwnerOnboarding,
        branches: [],
        config: { configuracion: { nombreNegocio: "Barbería Elite", giroComercial: "Barbería" } },
      });

      // Verificación estricta de ausencia de Tailwind crudo / azul / slate
      expect(html).not.toContain("bg-blue-600");
      expect(html).not.toContain("text-blue-600");
      expect(html).not.toContain("text-slate-900");
      expect(html).not.toContain("text-slate-700");
      expect(html).not.toContain("text-slate-600");
      expect(html).not.toContain("text-slate-500");
      expect(html).not.toContain("text-slate-300");
      expect(html).not.toContain("text-slate-200");
      expect(html).not.toContain("border-slate");
      expect(html).not.toContain("bg-white");
      expect(html).not.toContain("dark:bg-slate-900");
    });

    it("renderiza el sello de progreso risográfico ('1 / 3' y 'PASOS') (§5.6.1)", () => {
      const html = renderWithClient(React.createElement(OnboardingPage), {
        auth: newOwnerOnboarding,
        branches: [],
        config: { configuracion: { nombreNegocio: "Barbería Elite", giroComercial: "Barbería" } },
      });

      // Elemento sello con borde perforado y rotación
      expect(html).toContain("sello text-grape border-grape/40 shrink-0");
      expect(html).toContain("1 / 3");
      expect(html).toContain("PASOS");
      expect(html).toContain("border-dashed border-border");
    });

    it("renderiza el botón primario de Agendur con tokens oficiales (bg-grape / Button)", () => {
      const html = renderWithClient(React.createElement(OnboardingPage), {
        auth: newOwnerOnboarding,
        branches: [],
        config: { configuracion: { nombreNegocio: "Barbería Elite", giroComercial: "Barbería" } },
      });

      // Botón submit con tokens Agendur
      expect(html).toContain("bg-grape text-white");
      expect(html).toContain("rounded-[var(--radius-md)]");
      expect(html).toContain('type="submit"');
      expect(html).toContain("Guardar y abrir panel");
    });

    it("renderiza tarjetas de sección con tokens oficiales y campos de entrada estandarizados", () => {
      const html = renderWithClient(React.createElement(OnboardingPage), {
        auth: newOwnerOnboarding,
        branches: [],
        config: { configuracion: { nombreNegocio: "Barbería Elite", giroComercial: "Barbería" } },
      });

      // Tarjetas de sección
      expect(html).toContain("bg-surface border border-border rounded-[var(--radius-md)] p-6 shadow-2xs");
      expect(html).toContain("Tu identidad");
      expect(html).toContain("Negocio");
      expect(html).toContain("Primera sucursal");

      // Inputs con focus grape
      expect(html).toContain("bg-surface-alt/50 border border-border focus:border-grape focus:ring-1 focus:ring-grape");

      // Marcas numéricas mono
      expect(html).toContain("font-mono tabular-nums");

      // PendingBadge en teléfono opcional
      expect(html).toContain("Opcional");
      expect(html).toContain('title="Dato opcional para contacto del administrador"');
    });

    it("renderiza encabezado con tipografía Bricolage Grotesque", () => {
      const html = renderWithClient(React.createElement(OnboardingPage), {
        auth: newOwnerOnboarding,
        branches: [],
        config: { configuracion: { nombreNegocio: "Barbería Elite", giroComercial: "Barbería" } },
      });

      expect(html).toContain("font-bricolage font-bold text-2xl sm:text-3xl text-text-primary tracking-tight");
      expect(html).toContain("Completa tu negocio");
    });

    it("mantiene intactos los estados especiales (sucursal ya registrada y estados de error)", () => {
      // Estado cuando ya existe sucursal
      const readyHtml = renderWithClient(React.createElement(OnboardingPage), {
        auth: { ...newOwnerOnboarding, onboardingStatus: "complete" },
        branches: [{ id: "branch-existing" }],
      });
      expect(readyHtml).toContain("Tu primera sucursal ya está registrada");
      expect(readyHtml).toContain("El onboarding está completo.");
      expect(readyHtml).toContain('href="/dashboard"');
      expect(readyHtml).not.toContain("bg-blue-600");
      expect(readyHtml).not.toContain("text-blue-600");

      // Estado cuando no hay negocio asociado
      const noBusinessHtml = renderWithClient(React.createElement(OnboardingPage), {
        auth: { ...newOwnerOnboarding, negocio: null },
      });
      expect(noBusinessHtml).toContain("Esta cuenta no tiene un negocio asociado");
      expect(noBusinessHtml).toContain("text-danger");
    });
  });
});
