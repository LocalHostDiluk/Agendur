"use client";

import { useState } from "react";
import { Sparkles, Scissors, Stethoscope, Flower2 } from "lucide-react";
import {
  LANDING_IMPACT_INDUSTRIES,
  type IndustryKey,
} from "@/lib/utils/landing-impact";
import { ImpactChartMetrics } from "./ImpactChartMetrics";
import { ImpactChartRoiCard } from "./ImpactChartRoiCard";

export function ImpactChartSection() {
  const [selectedIndustry, setSelectedIndustry] =
    useState<IndustryKey>("belleza");
  const data = LANDING_IMPACT_INDUSTRIES[selectedIndustry];

  return (
    <section
      id="impacto"
      className="py-16 sm:py-24 bg-white dark:bg-neutral-950 relative transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            Impacto Medible y Resultados Reales
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            ¿Por qué elegir Agendur frente a la gestión manual?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-neutral-400">
            Compara el rendimiento de operar con cuadernos y WhatsApp manual
            versus la automatización integral de Agendur.
          </p>

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

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <ImpactChartMetrics data={data} />
          <ImpactChartRoiCard data={data} />
        </div>
      </div>
    </section>
  );
}
