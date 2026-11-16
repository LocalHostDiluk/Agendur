import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui";
import type { Cita } from "@/lib/types";
import { DashboardCitasEmpty } from "./DashboardCitasEmpty";
import { DashboardCitasError } from "./DashboardCitasError";
import { DashboardCitasSkeleton } from "./DashboardCitasSkeleton";
import { DashboardCitasViews } from "./DashboardCitasViews";

interface DashboardCitasProps {
  citasLoading: boolean;
  citasError: boolean;
  citas: Cita[];
  handleRetryAll: () => Promise<void>;
  isRetrying: boolean;
  copyBookingUrl: () => void;
  negocioSlug?: string;
  copied: boolean;
}

export function DashboardCitas({ citasLoading, citasError, citas, handleRetryAll, isRetrying, copyBookingUrl, negocioSlug, copied }: DashboardCitasProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bricolage font-bold text-base text-text-primary">
            Citas Recientes y Próximas
          </h2>
          <p className="text-xs text-text-secondary">
            Listado de reservaciones de clientes en tiempo real
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/agendas">
            <Button
              variant="secondary"
              size="sm"
              className="inline-flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-grape" />
              <span>Ver agenda completa</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
      {citasLoading && <DashboardCitasSkeleton />}
      {!citasLoading && citasError && (
        <DashboardCitasError handleRetryAll={handleRetryAll} isRetrying={isRetrying} />
      )}
      {!citasLoading && !citasError && citas.length === 0 && (
        <DashboardCitasEmpty copyBookingUrl={copyBookingUrl} negocioSlug={negocioSlug} copied={copied} />
      )}
      {!citasLoading && !citasError && citas.length > 0 && (
        <DashboardCitasViews citas={citas} />
      )}
    </div>
  );
}
