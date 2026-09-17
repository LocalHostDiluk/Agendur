import { describe, it, expect } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  SkeletonBlock,
  SkeletonText,
  SkeletonCircle,
} from "@/components/ui/Skeleton";
import { useDelayedSkeleton } from "@/lib/hooks/use-delayed-skeleton";
import DashboardLoading from "@/app/(negocio)/dashboard/loading";
import AgendasLoading from "@/app/(negocio)/agendas/loading";
import SucursalesLoading from "@/app/(negocio)/sucursales/loading";
import PersonalLoading from "@/app/(negocio)/personal/loading";
import ConfiguracionLoading from "@/app/(negocio)/configuracion/loading";
import {
  PortalSkeletons,
  PortalCalendarSkeleton,
  PortalServicesSkeleton,
} from "@/components/cliente/PortalSkeletons";

describe("Sistema Base de Skeletons — Agendur UI", () => {
  describe("Primitivas Skeleton", () => {
    it("SkeletonBlock renderiza con clase .skel-block y aria-hidden='true'", () => {
      const html = renderToStaticMarkup(
        React.createElement(SkeletonBlock, { className: "w-32 h-8" })
      );
      expect(html).toContain("skel-block");
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain("w-32");
      expect(html).toContain("h-8");
    });

    it("SkeletonText renderiza con clase .skel-text y aria-hidden='true'", () => {
      const html = renderToStaticMarkup(
        React.createElement(SkeletonText, { className: "w-48 h-4" })
      );
      expect(html).toContain("skel-text");
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain("w-48");
      expect(html).toContain("h-4");
    });

    it("SkeletonCircle renderiza con clase .skel-circle y aria-hidden='true'", () => {
      const html = renderToStaticMarkup(
        React.createElement(SkeletonCircle, { className: "w-12 h-12" })
      );
      expect(html).toContain("skel-circle");
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain("w-12");
      expect(html).toContain("h-12");
    });

    it("Soporta estilos inline personalizados", () => {
      const html = renderToStaticMarkup(
        React.createElement(SkeletonText, { style: { width: "70%" } })
      );
      expect(html).toContain("width:70%");
    });
  });

  describe("Hook useDelayedSkeleton (Reglas S.1, S.2, S.3)", () => {
    function HookTestComponent({
      isLoading,
      delayMs,
      minDisplayMs,
      onState,
    }: {
      isLoading: boolean;
      delayMs?: number;
      minDisplayMs?: number;
      onState: (state: boolean) => void;
    }) {
      const show = useDelayedSkeleton(isLoading, { delayMs, minDisplayMs });
      onState(show);
      return React.createElement("div", null, show ? "SKELETON" : "CONTENT");
    }

    it("Permanece false cuando isLoading es false", () => {
      let state = false;
      const html = renderToStaticMarkup(
        React.createElement(HookTestComponent, {
          isLoading: false,
          onState: (s) => {
            state = s;
          },
        })
      );
      expect(state).toBe(false);
      expect(html).toContain("CONTENT");
    });
  });

  describe("Rutas loading.tsx del Dashboard Interior (Regla S.4)", () => {
    it("/dashboard/loading.tsx replica KPIs, gráfica y tabla", () => {
      const html = renderToStaticMarkup(React.createElement(DashboardLoading));
      expect(html).toContain("skel-block");
      expect(html).toContain("skel-text");
      expect(html).toContain("Cliente");
      expect(html).toContain("Sede / Sucursal");
      expect(html).toContain("Precio");
    });

    it("/agendas/loading.tsx replica header y cuadrícula con números visibles y dots", () => {
      const html = renderToStaticMarkup(React.createElement(AgendasLoading));
      expect(html).toContain("Calendario &amp; Agendas");
      expect(html).toContain("skel-circle");
      // Días y números visibles
      expect(html).toContain("LUN");
      expect(html).toContain("15");
      expect(html).toContain("DOM");
      expect(html).toContain("21");
    });

    it("/sucursales/loading.tsx replica pestañas y tarjetas", () => {
      const html = renderToStaticMarkup(React.createElement(SucursalesLoading));
      expect(html).toContain("Servicios y sucursales");
      expect(html).toContain("skel-block");
    });

    it("/personal/loading.tsx replica directorio con avatares circulares", () => {
      const html = renderToStaticMarkup(React.createElement(PersonalLoading));
      expect(html).toContain("Personal y equipo");
      expect(html).toContain("skel-circle");
      expect(html).toContain("skel-block");
    });

    it("/configuracion/loading.tsx replica 3 pestañas y tarjetas de formulario", () => {
      const html = renderToStaticMarkup(React.createElement(ConfiguracionLoading));
      expect(html).toContain("Configuración");
      expect(html).toContain("skel-block");
      expect(html).toContain("skel-text");
    });
  });

  describe("Skeletons del Portal de Reservas (Sección 2.2)", () => {
    it("PortalSkeletons renderiza logo 48px, nombre 140x20px y servicios", () => {
      const html = renderToStaticMarkup(React.createElement(PortalSkeletons));
      expect(html).toContain("skel-circle");
      expect(html).toContain("w-12 h-12");
      expect(html).toContain("w-[140px] h-[20px]");
      expect(html).toContain("skel-block");
    });

    it("PortalCalendarSkeleton sin dots para carga inicial del negocio", () => {
      const html = renderToStaticMarkup(
        React.createElement(PortalCalendarSkeleton, { showAvailabilityDots: false })
      );
      expect(html).toContain("Dom");
      expect(html).toContain("Lun");
      expect(html).not.toContain("w-1 h-1");
    });

    it("PortalCalendarSkeleton con dots para recarga de disponibilidad mensual", () => {
      const html = renderToStaticMarkup(
        React.createElement(PortalCalendarSkeleton, { showAvailabilityDots: true })
      );
      expect(html).toContain("w-1 h-1");
    });

    it("PortalServicesSkeleton renderiza 3 tarjetas con .skel-block", () => {
      const html = renderToStaticMarkup(React.createElement(PortalServicesSkeleton));
      expect(html).toContain("skel-block");
      const matches = html.match(/skel-block/g);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBeGreaterThanOrEqual(3);
    });
  });
});
