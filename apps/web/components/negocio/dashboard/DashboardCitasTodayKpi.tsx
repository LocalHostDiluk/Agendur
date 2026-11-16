import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui";
import { DashboardKpiCard } from "./DashboardKpiCard";

interface DashboardCitasTodayKpiProps {
  isSyncError: boolean;
  citasError: boolean;
  citasHoyCount: number;
  citasPendientesCount: number;
}

export function DashboardCitasTodayKpi({
  isSyncError, citasError,
  citasHoyCount, citasPendientesCount,
}: DashboardCitasTodayKpiProps) {
  return (
    <DashboardKpiCard
      title="Citas para hoy"
      icon={<Calendar className="w-4 h-4 text-grape" />}
      delay={0.04}
      highlighted
      metric={citasHoyCount}
      status={isSyncError || citasError ? (
        <Badge variant="warning" size="sm" dot={true}>
          Sin sincronizar
        </Badge>
      ) : citasPendientesCount > 0 ? (
        <Badge variant="warning" size="sm" dot={true}>
          {citasPendientesCount} pendiente
          {citasPendientesCount === 1 ? "" : "s"}
        </Badge>
      ) : (
        <Badge variant="success" size="sm" dot={true}>
          Al día
        </Badge>
      )}
      footer={
        <div className="flex items-center justify-between text-[11px] text-text-secondary">
          <span className="truncate">
            {isSyncError || citasError
              ? "Revisa o agenda manualmente"
              : `${citasHoyCount} ${citasHoyCount === 1 ? "cita programada" : "citas programadas"}`}
          </span>
          <Link
            href="/agendas"
            className="text-grape font-medium hover:underline inline-flex items-center gap-0.5 shrink-0"
          >
            <span>Ver agenda</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      }
    />
  );
}
