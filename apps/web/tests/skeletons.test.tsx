import { describe, it, expect } from "bun:test";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
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

  describe("Hook useDelayedSkeleton (Design-system.md §8.1)", () => {
    interface MinimalNode {
      nodeType: number;
      tagName: string;
      nodeName: string;
      childNodes: MinimalNode[];
      style: Record<string, string>;
      ownerDocument: MinimalDocument | null;
      parentNode: MinimalNode | null;
      textContent: string;
      nodeValue?: string;
      data?: string;
      appendChild: (child: MinimalNode) => MinimalNode;
      removeChild: (child: MinimalNode) => MinimalNode;
      insertBefore: (child: MinimalNode, ref: MinimalNode | null) => MinimalNode;
      addEventListener: () => void;
      removeEventListener: () => void;
    }

    interface MinimalDocument {
      nodeType: number;
      defaultView: typeof globalThis | null;
      createElement: (tag: string) => MinimalNode;
      createElementNS: (_ns: string, tag: string) => MinimalNode;
      createTextNode: (text: string) => MinimalNode;
      createComment: (text: string) => MinimalNode;
      activeElement: null;
      addEventListener: () => void;
      removeEventListener: () => void;
    }

    async function withDomHarness(
      fn: (container: MinimalNode) => Promise<void>
    ): Promise<void> {
      const makeNode = (nodeType: number, tagName = ""): MinimalNode => {
        const node: MinimalNode = {
          nodeType,
          tagName,
          nodeName: tagName,
          childNodes: [],
          style: {},
          ownerDocument: null,
          parentNode: null,
          textContent: "",
          appendChild(child) {
            child.parentNode = node;
            node.childNodes.push(child);
            return child;
          },
          removeChild(child) {
            node.childNodes = node.childNodes.filter((item) => item !== child);
            child.parentNode = null;
            return child;
          },
          insertBefore(child, ref) {
            child.parentNode = node;
            const index = ref ? node.childNodes.indexOf(ref) : -1;
            if (index === -1) node.childNodes.push(child);
            else node.childNodes.splice(index, 0, child);
            return child;
          },
          addEventListener() {},
          removeEventListener() {},
        };
        return node;
      };

      const doc: MinimalDocument = {
        nodeType: 9,
        defaultView: globalThis,
        createElement: (tag) =>
          Object.assign(makeNode(1, tag.toUpperCase()), { ownerDocument: doc }),
        createElementNS: (_ns, tag) =>
          Object.assign(makeNode(1, tag.toUpperCase()), { ownerDocument: doc }),
        createTextNode: (text) =>
          Object.assign(makeNode(3), {
            nodeValue: text,
            textContent: text,
            data: text,
            ownerDocument: doc,
          }),
        createComment: (text) =>
          Object.assign(makeNode(8), {
            nodeValue: text,
            data: text,
            ownerDocument: doc,
          }),
        activeElement: null,
        addEventListener() {},
        removeEventListener() {},
      };

      const g = globalThis as Record<string, unknown>;
      const prev = {
        document: g.document,
        window: g.window,
        HTMLIFrameElement: g.HTMLIFrameElement,
        IS_REACT_ACT_ENVIRONMENT: g.IS_REACT_ACT_ENVIRONMENT,
      };

      g.document = doc;
      g.window = globalThis;
      g.HTMLIFrameElement = function HTMLIFrameElement() {};
      g.IS_REACT_ACT_ENVIRONMENT = true;

      try {
        await fn(doc.createElement("div"));
      } finally {
        for (const [key, val] of Object.entries(prev)) {
          if (val === undefined) delete g[key];
          else g[key] = val;
        }
      }
    }

    function HookTestComponent({
      isLoading,
      delayMs,
      onState,
    }: {
      isLoading: boolean;
      delayMs?: number;
      onState: (state: boolean) => void;
    }) {
      const show = useDelayedSkeleton(isLoading, { delayMs });
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

    it("No muestra skeleton si la carga termina antes de delayMs (200ms)", async () => {
      await withDomHarness(async (container) => {
        const states: boolean[] = [];
        const root = createRoot(container as unknown as Element);

        await act(async () => {
          root.render(
            React.createElement(HookTestComponent, {
              isLoading: true,
              delayMs: 200,
              onState: (s) => states.push(s),
            })
          );
        });
        expect(states.at(-1)).toBe(false);
        expect(container.childNodes[0]?.textContent).toBe("CONTENT");

        // Carga finaliza antes de los 200ms
        await act(async () => {
          root.render(
            React.createElement(HookTestComponent, {
              isLoading: false,
              delayMs: 200,
              onState: (s) => states.push(s),
            })
          );
        });
        expect(states.at(-1)).toBe(false);
        expect(container.childNodes[0]?.textContent).toBe("CONTENT");

        // Incluso después de que habría vencido delayMs, nunca aparece
        await act(async () => {
          await new Promise((r) => setTimeout(r, 220));
        });
        expect(states.every((s) => s === false)).toBe(true);
        expect(container.childNodes[0]?.textContent).toBe("CONTENT");

        await act(async () => {
          root.unmount();
        });
      });
    });

    it("Muestra skeleton tras delayMs y lo oculta de inmediato al pasar isLoading a false (sin hold de 400ms)", async () => {
      await withDomHarness(async (container) => {
        let latest = false;
        const root = createRoot(container as unknown as Element);

        await act(async () => {
          root.render(
            React.createElement(HookTestComponent, {
              isLoading: true,
              delayMs: 20,
              onState: (s) => {
                latest = s;
              },
            })
          );
        });
        expect(latest).toBe(false);
        expect(container.childNodes[0]?.textContent).toBe("CONTENT");

        await act(async () => {
          await new Promise((r) => setTimeout(r, 50));
        });
        expect(latest).toBe(true);
        expect(container.childNodes[0]?.textContent).toBe("SKELETON");

        const startedAt = performance.now();
        await act(async () => {
          root.render(
            React.createElement(HookTestComponent, {
              isLoading: false,
              delayMs: 20,
              onState: (s) => {
                latest = s;
              },
            })
          );
        });
        const elapsedMs = performance.now() - startedAt;

        expect(latest).toBe(false);
        expect(container.childNodes[0]?.textContent).toBe("CONTENT");
        expect(elapsedMs).toBeLessThan(100);

        await act(async () => {
          root.unmount();
        });
      });
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
