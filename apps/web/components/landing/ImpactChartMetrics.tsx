import type { ReactNode } from "react";
import { TrendingDown, Clock, Moon, CheckCircle2 } from "lucide-react";
import type { IndustryData } from "@/lib/utils/landing-impact";

export interface ImpactChartMetricsProps {
  data: IndustryData;
}

function MetricBlock({
  icon,
  title,
  badgeText,
  badgeClass,
  manualWidth,
  manualBarClass,
  manualLabel,
  agendurWidth,
  agendurBarClass,
  agendurLabel,
  className = "mb-6",
}: {
  icon: ReactNode;
  title: string;
  badgeText: string;
  badgeClass: string;
  manualWidth: string;
  manualBarClass: string;
  manualLabel: string;
  agendurWidth: string;
  agendurBarClass: string;
  agendurLabel: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-gray-800 dark:text-neutral-200">
            {title}
          </span>
        </div>
        <span className={`inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-xs font-bold border ${badgeClass}`}>
          <CheckCircle2 className="size-3" /> {badgeText}
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <span className="w-16 text-xs text-gray-500 dark:text-neutral-400">Manual</span>
          <div className="flex-1 bg-gray-200 dark:bg-neutral-800 rounded-full h-4 overflow-hidden">
            <div className={`${manualBarClass} h-full rounded-full flex items-center px-2 text-[10px] font-bold text-white`} style={{ width: manualWidth }}>
              {manualLabel}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-16 text-xs font-semibold text-blue-600 dark:text-blue-400">Agendur</span>
          <div className="flex-1 bg-gray-200 dark:bg-neutral-800 rounded-full h-4 overflow-hidden">
            <div className={`${agendurBarClass} h-full rounded-full flex items-center justify-end px-2 text-[10px] font-bold text-white transition-all duration-500`} style={{ width: agendurWidth }}>
              {agendurLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ImpactChartMetrics({ data }: ImpactChartMetricsProps) {
  return (
    <div className="lg:col-span-8 bg-gray-50/75 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-neutral-800 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Comparativa de Rendimiento Operativo
            </h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Sector:{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">{data.title}</span>{" "}
              ({data.subtitle})
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-gray-300 dark:bg-neutral-700" />
              <span className="text-gray-500 dark:text-neutral-400">Manual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-blue-600" />
              <span className="font-semibold text-blue-600 dark:text-blue-400">Agendur</span>
            </div>
          </div>
        </div>

        <MetricBlock
          icon={<TrendingDown className="size-4 text-emerald-600 dark:text-emerald-400" />}
          title="1. Ausentismo / No-Shows (% de citas perdidas)"
          badgeText={data.noShowDiff}
          badgeClass="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
          manualWidth={`${data.noShowManual * 3}%`}
          manualBarClass="bg-red-400/80 dark:bg-red-500/80 justify-end transition-all duration-500"
          manualLabel={`${data.noShowManual}%`}
          agendurWidth={`${data.noShowAgendur * 3 + 8}%`}
          agendurBarClass="bg-emerald-500"
          agendurLabel={`${data.noShowAgendur}%`}
        />

        <MetricBlock
          icon={<Clock className="size-4 text-blue-600 dark:text-blue-400" />}
          title="2. Horas semanales en mensajes y llamadas"
          badgeText={data.hoursDiff}
          badgeClass="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800"
          manualWidth={`${(data.hoursManual / 25) * 100}%`}
          manualBarClass="bg-amber-400/90 dark:bg-amber-500/80 justify-end transition-all duration-500"
          manualLabel={`${data.hoursManual} hrs/sem`}
          agendurWidth={`${(data.hoursAgendur / 25) * 100 + 12}%`}
          agendurBarClass="bg-blue-600"
          agendurLabel={`${data.hoursAgendur} hrs`}
        />

        <MetricBlock
          icon={<Moon className="size-4 text-indigo-600 dark:text-indigo-400" />}
          title="3. Citas agendadas fuera del horario comercial (Noches / Domingos)"
          badgeText={data.afterHoursDiff}
          badgeClass="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
          manualWidth="5%"
          manualBarClass="bg-gray-400 dark:bg-neutral-600"
          manualLabel="0%"
          agendurWidth={`${data.afterHoursAgendur * 1.8}%`}
          agendurBarClass="bg-indigo-600"
          agendurLabel={`${data.afterHoursAgendur}% de reservas`}
          className=""
        />
      </div>

      <p className="text-[11px] text-gray-500 dark:text-neutral-500 mt-6 pt-3 border-t border-gray-200 dark:border-neutral-800">
        * Datos recopilados de más de 1,200 negocios activos antes y después de implementar Agendur durante un periodo de 90 días.
      </p>
    </div>
  );
}
