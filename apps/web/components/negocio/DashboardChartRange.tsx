"use client";

import { PendingBadge } from "@/components/ui";

interface DashboardChartRangeProps {
  rangoCitas: "30d" | "mes";
  setRangoCitas: (range: "30d" | "mes") => void;
}

export function DashboardChartRange({ rangoCitas, setRangoCitas }: DashboardChartRangeProps) {
  return (
            <div className="flex items-center gap-1 bg-surface-alt p-1 rounded-lg border border-border text-xs">
              <button
                type="button"
                onClick={() => setRangoCitas("30d")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  rangoCitas === "30d"
                    ? "bg-surface text-text-primary shadow-2xs font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Últimos 30 días
              </button>
              <button
                type="button"
                onClick={() => setRangoCitas("mes")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  rangoCitas === "mes"
                    ? "bg-surface text-text-primary shadow-2xs font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Este mes
              </button>
              <div className="inline-flex items-center gap-1 px-2 py-1 text-text-muted cursor-not-allowed">
                <span>Personalizado</span>
                <PendingBadge
                  label="Próximamente"
                  tooltip="Filtro de fecha personalizado en desarrollo"
                />
              </div>
            </div>
  );
}
