"use client";

import { Toaster } from "sileo";
import { useTheme } from "@/components/theme/ThemeProvider";

/**
 * Componente cliente que sincroniza dinámicamente el Toaster de Sileo
 * con el estado activo de tema (Dark / Light) y la ubicación superior derecha (top-right).
 */
export function SileoToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      offset={{ top: 24, right: 24 }}
      theme={theme}
      options={{
        roundness: 16,
      }}
    />
  );
}
