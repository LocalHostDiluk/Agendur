import type { Metadata } from "next";
import { ErrorShell } from "@/components/errors/ErrorShell";
import { ForbiddenVisual } from "@/components/errors/ForbiddenVisual";

export const metadata: Metadata = {
  title: "No tienes acceso a esta sección - Agendur",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Página 403 — Sin acceso (REGLA A.4).
 * Animación central de Ticket con sello 'SIN ACCESO' en color --danger.
 * Fondo limpio sin decoraciones (REGLA A.8).
 */
export default function ForbiddenPage() {
  return (
    <ErrorShell
      title="No tienes acceso a esta sección."
      description="Tu rol actual no incluye permisos para ver esta página. Si crees que es un error, contacta al dueño de la cuenta."
      code="ERROR 403"
      primaryAction={{
        label: "Volver a mi panel",
        href: "/dashboard",
      }}
      secondaryAction={{
        label: "Contactar soporte",
        href: "mailto:soporte@agendur.app",
      }}
      animation={<ForbiddenVisual />}
    />
  );
}
