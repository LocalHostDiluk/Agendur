"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useAuthMe, useConfiguracion } from "@/lib/hooks";
import { ConfiguracionLoading } from "./loading";
import { ConfiguracionForm } from "@/components/negocio";
import { type ConfigTab } from "@/lib/constants/configuracion";

export default function ConfiguracionPage({
  initialTab = "perfil",
}: {
  initialTab?: ConfigTab;
} = {}) {
  const { data: session, isLoading: sessionLoading } = useAuthMe();
  const permitted = session?.access?.capabilities
    ? session.access.capabilities.includes("config:read")
    : true;
  const {
    data: configData,
    isLoading: configLoading,
    isError: configError,
    refetch: refetchConfig,
  } = useConfiguracion(permitted);

  const configuracion = configData?.configuracion;
  const showLoading = sessionLoading || (configLoading && !configData && !configError);
  const showError =
    configError || (!configLoading && configData && !configuracion);

  if (session && !permitted) return <p>No tienes permiso para administrar la configuración.</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* STATE 1: LOADING */}
      {showLoading && (
        <div className="space-y-4 animate-pulse" data-testid="config-loading">
          <ConfiguracionLoading />
        </div>
      )}

      {/* STATE 2: ERROR */}
      {showError && (
        <div
          role="alert"
          className="bg-danger/10 border border-danger/20 rounded-2xl p-6 text-center space-y-3"
        >
          <div className="size-12 rounded-full bg-danger/15 text-danger flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bricolage font-bold text-lg text-text-primary">
            No se pudo cargar la configuración
          </h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Ocurrió un error al consultar los parámetros del negocio. Por favor
            intenta de nuevo.
          </p>
          <button
            type="button"
            onClick={() => refetchConfig()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium text-text-primary hover:bg-surface-alt transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* STATE 3 & 4: FORM WITH DATA */}
      {!configLoading && !configError && configuracion && (
        <ConfiguracionForm
          key={configuracion.id || "loaded"}
          configuracion={configuracion}
          initialTab={initialTab}
        />
      )}
    </div>
  );
}
