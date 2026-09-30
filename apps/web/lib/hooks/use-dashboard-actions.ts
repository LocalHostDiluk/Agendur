"use client";

import { notify } from "@/lib/utils/toast";

interface DashboardActionsOptions {
  negocioSlug?: string;
  setCopied: (value: boolean) => void;
  setIsRetrying: (value: boolean) => void;
  refetchAuth: () => Promise<unknown>;
  refetchSucursales: () => Promise<unknown>;
  refetchSuscripcion: () => Promise<unknown>;
  refetchConfiguracion: () => Promise<unknown>;
  refetchCitas: () => Promise<unknown>;
}

export function useDashboardActions({
  negocioSlug,
  setCopied,
  setIsRetrying,
  refetchAuth,
  refetchSucursales,
  refetchSuscripcion,
  refetchConfiguracion,
  refetchCitas,
}: DashboardActionsOptions) {
  const handleRetryAll = async () => {
    setIsRetrying(true);
    try {
      await Promise.allSettled([
        refetchAuth(),
        refetchSucursales(),
        refetchSuscripcion(),
        refetchConfiguracion(),
        refetchCitas(),
      ]);
    } finally {
      setTimeout(() => setIsRetrying(false), 350);
    }
  };

  const copyBookingUrl = () => {
    if (!negocioSlug) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/reserva/${negocioSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    notify.success("Enlace copiado", "Se copió el enlace al portapapeles.");
    setTimeout(() => setCopied(false), 2000);
  };
  return { handleRetryAll, copyBookingUrl };
}
