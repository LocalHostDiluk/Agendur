"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingDown,
  Clock,
  Moon,
  Sparkles,
  ArrowRight,
  Scissors,
  Stethoscope,
  Flower2,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

type IndustryKey = "belleza" | "salud" | "bienestar";

interface IndustryData {
  title: string;
  subtitle: string;
  noShowManual: number;
  noShowCitaSync: number;
  noShowDiff: string;
  hoursManual: number;
  hoursCitaSync: number;
  hoursDiff: string;
  afterHoursManual: number;
  afterHoursCitaSync: number;
  afterHoursDiff: string;
  monthlyRoi: string;
  roiDescription: string;
}

const industries: Record<IndustryKey, IndustryData> = {
  belleza: {
    title: "Belleza & Barbería",
    subtitle: "Peluquerías, Barber Shops, Salones y Estilistas",
    noShowManual: 24,
    noShowCitaSync: 3.2,
    noShowDiff: "-85% ausentismo",
    hoursManual: 18,
    hoursCitaSync: 0.5,
    hoursDiff: "+17.5 hrs ahorradas",
    afterHoursManual: 0,
    afterHoursCitaSync: 38,
    afterHoursDiff: "38% agendadas de noche",
    monthlyRoi: "$1,250 USD",
    roiDescription:
      "Recuperados al mes en cortes no perdidos y tiempo del personal",
  },
  salud: {
    title: "Salud & Clínicas",
    subtitle: "Consultorios Médicos, Clínicas Dentales y Fisioterapia",
    noShowManual: 28,
    noShowCitaSync: 4.1,
    noShowDiff: "-85% ausentismo",
    hoursManual: 22,
    hoursCitaSync: 1.0,
    hoursDiff: "+21 hrs ahorradas",
    afterHoursManual: 0,
    afterHoursCitaSync: 42,
    afterHoursDiff: "42% agendadas de noche",
    monthlyRoi: "$2,400 USD",
    roiDescription:
      "En consultas médicas confirmadas con anticipo y cero horas muertas",
  },
  bienestar: {
    title: "Bienestar & Spas",
    subtitle: "Centros de Masaje, Spas, Tatuajes y Terapias",
    noShowManual: 22,
    noShowCitaSync: 2.8,
    noShowDiff: "-87% ausentismo",
    hoursManual: 16,
    hoursCitaSync: 0.5,
    hoursDiff: "+15.5 hrs ahorradas",
    afterHoursManual: 0,
    afterHoursCitaSync: 35,
    afterHoursDiff: "35% agendadas de noche",
    monthlyRoi: "$1,600 USD",
    roiDescription:
      "Asegurados mediante depósitos de reserva y recordatorios puntuales",
  },
};

export function ImpactChartSection() {
  const [selectedIndustry, setSelectedIndustry] =
    useState<IndustryKey>("belleza");
  const data = industries[selectedIndustry];

  return (
    <section
      id="impacto"
      className="py-16 sm:py-24 bg-white dark:bg-neutral-950 relative transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            Impacto Medible y Resultados Reales
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            ¿Por qué elegir CitaSync frente a la gestión manual?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-neutral-400">
            Compara el rendimiento de operar con cuadernos y WhatsApp manual
            versus la automatización integral de CitaSync.
          </p>

          {/* Industry Selector Tabs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIndustry("belleza")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedIndustry === "belleza"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }`}
            >
              <Scissors className="size-4" />
              Belleza & Barbería
            </button>

            <button
              type="button"
              onClick={() => setSelectedIndustry("salud")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedIndustry === "salud"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }`}
            >
              <Stethoscope className="size-4" />
              Salud & Clínicas
            </button>

            <button
              type="button"
              onClick={() => setSelectedIndustry("bienestar")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedIndustry === "bienestar"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }`}
            >
              <Flower2 className="size-4" />
              Bienestar & Spas
            </button>
          </div>
        </div>

        {/* Impact Comparison Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Visual Bars Column */}
          <div className="lg:col-span-8 bg-gray-50/75 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-neutral-800 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Comparativa de Rendimiento Operativo
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                    Sector:{" "}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {data.title}
                    </span>{" "}
                    ({data.subtitle})
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full bg-gray-300 dark:bg-neutral-700" />
                    <span className="text-gray-500 dark:text-neutral-400">
                      Manual
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full bg-blue-600" />
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      CitaSync
                    </span>
                  </div>
                </div>
              </div>

              {/* Metric 1: Ausentismo (No-Shows) */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-neutral-200">
                      1. Ausentismo / No-Shows (% de citas perdidas)
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="size-3" /> {data.noShowDiff}
                  </span>
                </div>

                {/* Bars */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-xs text-gray-500 dark:text-neutral-400">
                      Manual
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-neutral-800 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-red-400/80 dark:bg-red-500/80 h-full rounded-full flex items-center justify-end px-2 text-[10px] font-bold text-white transition-all duration-500"
                        style={{ width: `${data.noShowManual * 3}%` }}
                      >
                        {data.noShowManual}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-16 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      CitaSync
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-neutral-800 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full flex items-center justify-end px-2 text-[10px] font-bold text-white transition-all duration-500"
                        style={{ width: `${data.noShowCitaSync * 3 + 8}%` }}
                      >
                        {data.noShowCitaSync}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric 2: Horas Semanales en Mensajes/Llamadas */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-neutral-200">
                      2. Horas semanales en mensajes y llamadas
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    <CheckCircle2 className="size-3" /> {data.hoursDiff}
                  </span>
                </div>

                {/* Bars */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-xs text-gray-500 dark:text-neutral-400">
                      Manual
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-neutral-800 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-amber-400/90 dark:bg-amber-500/80 h-full rounded-full flex items-center justify-end px-2 text-[10px] font-bold text-white transition-all duration-500"
                        style={{ width: `${(data.hoursManual / 25) * 100}%` }}
                      >
                        {data.hoursManual} hrs/sem
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-16 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      CitaSync
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-neutral-800 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full flex items-center justify-end px-2 text-[10px] font-bold text-white transition-all duration-500"
                        style={{
                          width: `${(data.hoursCitaSync / 25) * 100 + 12}%`,
                        }}
                      >
                        {data.hoursCitaSync} hrs
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric 3: Citas Agendadas Fuera de Horario */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="size-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-neutral-200">
                      3. Citas agendadas fuera del horario comercial (Noches /
                      Domingos)
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    <CheckCircle2 className="size-3" /> {data.afterHoursDiff}
                  </span>
                </div>

                {/* Bars */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-xs text-gray-500 dark:text-neutral-400">
                      Manual
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-neutral-800 rounded-full h-4 overflow-hidden">
                      <div className="bg-gray-400 dark:bg-neutral-600 h-full rounded-full flex items-center px-2 text-[10px] font-bold text-white w-[5%]">
                        0%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-16 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      CitaSync
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-neutral-800 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full flex items-center justify-end px-2 text-[10px] font-bold text-white transition-all duration-500"
                        style={{ width: `${data.afterHoursCitaSync * 1.8}%` }}
                      >
                        {data.afterHoursCitaSync}% de reservas
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 dark:text-neutral-500 mt-6 pt-3 border-t border-gray-200 dark:border-neutral-800">
              * Datos recopilados de más de 1,200 negocios activos antes y
              después de implementar CitaSync durante un periodo de 90 días.
            </p>
          </div>

          {/* ROI Summary Card Column */}
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
                {data.roiDescription}. Con solo evitar 2 cancelaciones al mes,
                el plan CitaSync se paga solo.
              </p>

              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">
                    Costo mensual Plan PYME:
                  </span>
                  <span className="font-bold">$49 USD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">
                    Ingreso recuperado estimado:
                  </span>
                  <span className="font-bold text-emerald-300">
                    {data.monthlyRoi}
                  </span>
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
        </div>
      </div>
    </section>
  );
}
