import Link from "next/link";
import { ArrowRight, DollarSign } from "lucide-react";
import type { IndustryData } from "@/lib/utils/landing-impact";

export interface ImpactChartRoiCardProps {
  data: IndustryData;
}

export function ImpactChartRoiCard({ data }: ImpactChartRoiCardProps) {
  return (
    <div className="lg:col-span-4 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20">
      <div className="space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs">
          <DollarSign className="size-3.5" />
          Retorno de Inversión (ROI)
        </div>

        <div>
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tight block">
            {data.monthlyRoi}
          </span>
          <span className="text-xs uppercase tracking-wider text-blue-100 font-semibold block mt-1">
            Ganancia mensual estimada
          </span>
        </div>

        <p className="text-sm text-blue-100 leading-relaxed">
          {data.roiDescription}. Con solo evitar 2 cancelaciones al mes, el plan Agendur se paga solo.
        </p>

        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-blue-100">Costo mensual Plan PYME:</span>
            <span className="font-bold">$49 USD</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-100">Ingreso recuperado estimado:</span>
            <span className="font-bold text-emerald-300">{data.monthlyRoi}</span>
          </div>
          <div className="pt-2 border-t border-white/15 flex items-center justify-between font-bold text-sm">
            <span>Retorno Neto:</span>
            <span className="text-emerald-300">+2,400% ROI</span>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Link
          href="/register"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-white text-blue-700 hover:bg-blue-50 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Comenzar Prueba Gratuita
          <ArrowRight className="size-4" />
        </Link>
        <p className="text-center text-[11px] text-blue-200 mt-2">
          Sin contratos ni comisiones por cita.
        </p>
      </div>
    </div>
  );
}
