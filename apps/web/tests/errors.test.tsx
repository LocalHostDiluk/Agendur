import { describe, expect, it, mock } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Mock de Sentry y motion para testing server-side estático
mock.module("@sentry/nextjs", () => ({
  captureException: mock(),
}));

import { ErrorShell } from "@/components/errors/ErrorShell";
import NotFoundPage from "@/app/not-found";
import ForbiddenPage from "@/app/403/page";
import ErrorPage from "@/app/error";
import { BusinessNotFound } from "@/components/errors/BusinessNotFound";
import BusinessNotFoundRoute from "@/app/(cliente)/reserva/[negocioSlug]/not-found";

describe("Suite de Páginas de Error Risográficas (Parte A)", () => {
  describe("Shell Compartido (ErrorShell.tsx)", () => {
    it("cumple REGLA A.1: fondo permanente --ink (#1D1720) y contenedor min-h-screen", () => {
      const html = renderToStaticMarkup(
        <ErrorShell
          title="Prueba de Título"
          description="Prueba de Descripción"
          code="ERROR TEST"
          primaryAction={{ label: "Acción Principal", href: "/" }}
          animation={<div>Anim</div>}
        />
      );

      expect(html).toContain("min-h-screen");
      expect(html).toContain("#1D1720");
    });

    it("cumple REGLA A.4: incluye meta tag noindex", () => {
      const html = renderToStaticMarkup(
        <ErrorShell
          title="Prueba de Título"
          description="Prueba de Descripción"
          code="ERROR TEST"
          primaryAction={{ label: "Acción Principal", href: "/" }}
          animation={<div>Anim</div>}
        />
      );

      expect(html).toContain('<meta name="robots" content="noindex"/>');
    });

    it("cumple REGLA A.6: logo Agendur en la esquina superior izquierda como link a / por defecto", () => {
      const html = renderToStaticMarkup(
        <ErrorShell
          title="Prueba de Título"
          description="Prueba de Descripción"
          code="ERROR TEST"
          primaryAction={{ label: "Acción Principal", href: "/" }}
          animation={<div>Anim</div>}
        />
      );

      expect(html).toContain("Agendur");
      expect(html).toContain('href="/"');
      expect(html).toContain("top-6");
      expect(html).toContain("left-6");
    });

    it("cumple REGLA A.6 y A.10: logo Agendur NO es link cuando isLogoLink es false", () => {
      const html = renderToStaticMarkup(
        <ErrorShell
          title="Prueba de Título"
          description="Prueba de Descripción"
          code="ERROR TEST"
          primaryAction={{ label: "Acción Principal", href: "/" }}
          animation={<div>Anim</div>}
          isLogoLink={false}
        />
      );

      // Logo renderizado como span, sin enlace
      expect(html).toContain("Agendur");
      expect(html).not.toContain('<a href="/" class="font-[family-name:var(--font-bricolage)] text-[20px] font-bold text-[var(--text-on-ink,#F3EEDF)] tracking-tight hover:opacity-85 transition-opacity" aria-label="Agendur inicio">Agendur</a>');
    });

    it("aplica clase .btn-ticket en el botón primario y no en el secundario", () => {
      const html = renderToStaticMarkup(
        <ErrorShell
          title="Prueba de Título"
          description="Prueba de Descripción"
          code="ERROR TEST"
          primaryAction={{ label: "Primario", href: "/primario" }}
          secondaryAction={{ label: "Secundario", href: "/secundario" }}
          animation={<div>Anim</div>}
        />
      );

      expect(html).toContain("btn-ticket");
      expect(html).toContain('href="/primario"');
      expect(html).toContain('href="/secundario"');
    });

    it("renderiza perforación horizontal de 240px con borde ink", () => {
      const html = renderToStaticMarkup(
        <ErrorShell
          title="Prueba de Título"
          description="Prueba de Descripción"
          code="ERROR TEST"
          primaryAction={{ label: "Primario", href: "/primario" }}
          animation={<div>Anim</div>}
        />
      );

      expect(html).toContain("w-[240px]");
      expect(html).toContain("perforacion-ink");
    });
  });

  describe("Página 404 (not-found.tsx)", () => {
    it("renderiza título, descripción, código ERROR 404 y botón al inicio", () => {
      const html = renderToStaticMarkup(<NotFoundPage />);

      expect(html).toContain("Ese turno no existe.");
      expect(html).toContain(
        "La página que buscas no está aquí. Puede que el enlace esté mal escrito o que la página se haya movido."
      );
      expect(html).toContain("ERROR 404");
      expect(html).toContain("Volver al inicio");
      expect(html).toContain('href="/"');
      expect(html).toContain("404");
    });

    it("cumple REGLA A.7: NO renderiza 'Ir a mi panel' en el DOM inicial sin sesión activa", () => {
      const html = renderToStaticMarkup(<NotFoundPage />);

      expect(html).not.toContain("Ir a mi panel");
      expect(html).not.toContain('href="/dashboard"');
    });
  });

  describe("Página 403 (403/page.tsx)", () => {
    it("renderiza título, descripción, código ERROR 403 y botones correspondientes", () => {
      const html = renderToStaticMarkup(<ForbiddenPage />);

      expect(html).toContain("No tienes acceso a esta sección.");
      expect(html).toContain(
        "Tu rol actual no incluye permisos para ver esta página. Si crees que es un error, contacta al dueño de la cuenta."
      );
      expect(html).toContain("ERROR 403");
      expect(html).toContain("Volver a mi panel");
      expect(html).toContain('href="/dashboard"');
      expect(html).toContain("Contactar soporte");
      expect(html).toContain('href="mailto:soporte@agendur.app"');
    });

    it("cumple REGLA A.4: muestra animación central con sello 'SIN ACCESO'", () => {
      const html = renderToStaticMarkup(<ForbiddenPage />);

      expect(html).toContain("SIN ACCESO");
      expect(html).toContain("sello");
    });
  });

  describe("Página 500 (error.tsx)", () => {
    it("renderiza título, descripción, código ERROR 500 y botón Reintentar interactivo", () => {
      const resetMock = mock();
      const testError = new Error("Falló el servidor de prueba") as Error & { digest?: string };
      testError.digest = "test-digest-123";

      const html = renderToStaticMarkup(<ErrorPage error={testError} reset={resetMock} />);

      expect(html).toContain("Algo se atascó de nuestro lado.");
      expect(html).toContain(
        "No es culpa tuya. Ya nos enteramos del problema y lo estamos revisando. Intenta de nuevo en un momento."
      );
      expect(html).toContain("ERROR 500");
      expect(html).toContain("Reintentar");
      expect(html).toContain("Volver al inicio");
      expect(html).toContain('href="/"');
    });
  });

  describe("Página Negocio No Encontrado (reserva/[negocioSlug]/not-found.tsx)", () => {
    it("renderiza título, descripción comercial, código y botón Conocer Agendur", () => {
      const html = renderToStaticMarkup(<BusinessNotFoundRoute />);

      expect(html).toContain("No encontramos este negocio.");
      expect(html).toContain(
        "El enlace de reservas no existe o el negocio ya no está activo en Agendur. Te recomendamos contactar al negocio directamente para confirmar su enlace."
      );
      expect(html).toContain("NEGOCIO NO ENCONTRADO");
      expect(html).toContain("Conocer Agendur");
      expect(html).toContain('href="/"');
      expect(html).toContain("¿…?");
    });

    it("cumple REGLA A.10: CERO enlaces a /dashboard, /login, /registro ni secciones internas", () => {
      const html = renderToStaticMarkup(<BusinessNotFound />);

      expect(html).not.toContain('href="/dashboard"');
      expect(html).not.toContain('href="/login"');
      expect(html).not.toContain('href="/register"');
      expect(html).not.toContain('href="/registro"');
      expect(html).not.toContain('href="/onboarding"');
      expect(html).not.toContain('href="/agendas"');
      expect(html).not.toContain('href="/sucursales"');
    });

    it("cumple REGLA A.6: el logo NO es enlace", () => {
      const html = renderToStaticMarkup(<BusinessNotFound />);

      expect(html).toContain("Agendur");
      // Debe haber exactamente un link en la página: 'Conocer Agendur' a '/'
      const matches = html.match(/<a\s+[^>]*href=/g) || [];
      expect(matches.length).toBe(1);
    });
  });
});
