import React from "react";
import { ErrorShell } from "./ErrorShell";
import { BusinessNotFoundVisual } from "./BusinessNotFoundVisual";
import { NoiseBackground } from "./NoiseBackground";

/**
 * Vista completa para Negocio No Encontrado (REGLAS A.6, A.10).
 * Cliente final: CERO enlaces a /dashboard, /login o /registro. Logo NO es link.
 */
export function BusinessNotFound() {
  return (
    <ErrorShell
      title="No encontramos este negocio."
      description="El enlace de reservas no existe o el negocio ya no está activo en Agendur. Te recomendamos contactar al negocio directamente para confirmar su enlace."
      code="NEGOCIO NO ENCONTRADO"
      primaryAction={{
        label: "Conocer Agendur",
        href: "/",
      }}
      animation={<BusinessNotFoundVisual />}
      background={<NoiseBackground />}
      isLogoLink={false}
    />
  );
}
