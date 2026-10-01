"use client";

import Link from "next/link";
import { Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";
import { DashboardCitasTicket } from "./DashboardCitasTicket";

interface DashboardCitasErrorProps {
  handleRetryAll: () => Promise<void>;
  isRetrying: boolean;
}

export function DashboardCitasError({ handleRetryAll, isRetrying }: DashboardCitasErrorProps) {
  return (
    <div className="py-10 px-4 text-center flex flex-col items-center justify-center bg-surface-alt/35 border border-dashed border-border rounded-xl space-y-4">
      <div className="relative flex items-center justify-center">
        <DashboardCitasTicket variant="error" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bricolage font-bold text-base text-text-primary">
          No pudimos sincronizar tus citas recientes
        </h3>
        <p className="text-xs text-text-secondary max-w-md">
          Ocurrió un inconveniente al consultar las reservaciones en
          tiempo real. Puedes reintentar ahora o abrir directamente el
          módulo de Calendario.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Button
          variant="primary"
          size="sm"
          onClick={handleRetryAll}
          isLoading={isRetrying}
          className="cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reintentar sincronización</span>
        </Button>
        <Link href="/agendas">
          <Button variant="secondary" size="sm">
            <Calendar className="w-3.5 h-3.5 text-grape" />
            <span>Abrir Calendario</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
