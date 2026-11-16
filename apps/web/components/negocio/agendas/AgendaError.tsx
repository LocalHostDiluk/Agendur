"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

interface AgendaErrorProps {
  loadingCitas: boolean;
  errorCitas: boolean;
  refetchCitas: () => unknown;
}

export function AgendaError({ loadingCitas, errorCitas, refetchCitas }: AgendaErrorProps) {
  return (
    <>
{!loadingCitas && errorCitas && (
        <div
          role="alert"
          className="p-8 rounded-[var(--radius-lg)] bg-surface border border-danger/30 text-center space-y-4 shadow-xs"
        >
          <div className="w-12 h-12 rounded-full bg-danger-soft text-danger flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-text-primary font-bricolage">
              No se pudieron consultar las citas
            </h3>
            <p className="text-xs text-text-secondary">
              Ocurrió un error al consultar la agenda del negocio. Intenta
              recargar la información.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => refetchCitas()}
            className="gap-2 min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Reintentar</span>
          </Button>
        </div>
      )}
    </>
  );
}
