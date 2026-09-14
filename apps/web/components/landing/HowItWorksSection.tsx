"use client";

import React from "react";
import { useLandingLanguage } from "./LandingLanguageContext";
import {
  Stethoscope,
  Scissors,
  Sparkles,
  Apple,
  Store,
  Building2,
  Share2,
  BellRing,
} from "lucide-react";

export function HowItWorksSection() {
  const { t } = useLandingLanguage();

  const industryIcons = [
    {
      label: t.howItWorks.steps[0].industries?.[0] ?? "Clínica",
      icon: Stethoscope,
    },
    {
      label: t.howItWorks.steps[0].industries?.[1] ?? "Barbería",
      icon: Scissors,
    },
    { label: t.howItWorks.steps[0].industries?.[2] ?? "Spa", icon: Sparkles },
    {
      label: t.howItWorks.steps[0].industries?.[3] ?? "Nutriólogo",
      icon: Apple,
    },
    { label: t.howItWorks.steps[0].industries?.[4] ?? "Salón", icon: Store },
    {
      label: t.howItWorks.steps[0].industries?.[5] ?? "Consultorio",
      icon: Building2,
    },
  ];

  return (
    <section
      id="como-funciona"
      className="relative bg-paper text-ink py-20 lg:py-28 border-b-2 border-ink"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabecera de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-grape/10 border border-grape text-grape text-xs font-mono font-semibold">
            <span>{t.howItWorks.badge}</span>
          </div>
          <h2 className="font-bricolage font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink">
            {t.howItWorks.title}
          </h2>
          <p className="text-mist text-base sm:text-lg font-normal">
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* 3 Pasos en Secuencia con estética de boletos físicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Paso 1: Registra tu negocio con iconos inline */}
          <div className="relative bg-white border-2 border-ink p-6 sm:p-8 flex flex-col justify-between ticket-chamfer-tr">
            {/* Sello circular número de paso */}
            <div className="flex items-center justify-between pb-4 border-b border-ink/15">
              <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center font-mono font-bold text-lg">
                1
              </div>
              <span className="text-[11px] font-mono text-mist uppercase tracking-wider">
                Configuración
              </span>
            </div>

            <div className="py-6 space-y-4">
              <h3 className="font-bricolage font-semibold text-xl text-ink">
                {t.howItWorks.steps[0].title}
              </h3>
              <p className="text-sm text-mist leading-relaxed">
                {t.howItWorks.steps[0].desc}
              </p>

              {/* Iconos inline de industrias */}
              <div className="pt-2">
                <span className="text-[11px] font-mono text-mist block mb-2">
                  Especializado para:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {industryIcons.map((ind, i) => {
                    const Icon = ind.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-2 py-1.5 bg-paper border border-ink/20 text-ink text-xs font-medium"
                      >
                        <Icon className="w-3.5 h-3.5 text-grape shrink-0" />
                        <span className="truncate">{ind.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Separador tipo perforación */}
            <div className="pt-4 border-t-2 border-dashed border-ink/20 flex items-center justify-between text-[11px] font-mono text-mist">
              <span>PASO 01 / 03</span>
              <span className="text-grape font-bold">2 MINUTOS</span>
            </div>
          </div>

          {/* Paso 2: Comparte tu link */}
          <div className="relative bg-white border-2 border-ink p-6 sm:p-8 flex flex-col justify-between ticket-cutout-tr">
            <div className="flex items-center justify-between pb-4 border-b border-ink/15">
              <div className="w-10 h-10 rounded-full bg-grape text-paper flex items-center justify-center font-mono font-bold text-lg">
                2
              </div>
              <span className="text-[11px] font-mono text-mist uppercase tracking-wider">
                Difusión
              </span>
            </div>

            <div className="py-6 space-y-4">
              <h3 className="font-bricolage font-semibold text-xl text-ink">
                {t.howItWorks.steps[1].title}
              </h3>
              <p className="text-sm text-mist leading-relaxed">
                {t.howItWorks.steps[1].desc}
              </p>

              {/* Visualización del enlace único */}
              <div className="p-3.5 bg-paper border border-ink/25 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-ink">
                  <Share2 className="w-4 h-4 text-flame" />
                  <span className="font-bold truncate">
                    tunegocio.agendur.app
                  </span>
                </div>
                <p className="text-xs text-mist">
                  {t.howItWorks.steps[1].note}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-dashed border-ink/20 flex items-center justify-between text-[11px] font-mono text-mist">
              <span>PASO 02 / 03</span>
              <span className="text-flame font-bold">AUTOSERVICIO</span>
            </div>
          </div>

          {/* Paso 3: Agendur les recuerda por ti */}
          <div className="relative bg-white border-2 border-ink p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-ink/15">
              <div className="w-10 h-10 rounded-full bg-flame text-paper flex items-center justify-center font-mono font-bold text-lg">
                3
              </div>
              <span className="text-[11px] font-mono text-mist uppercase tracking-wider">
                Puntualidad
              </span>
            </div>

            <div className="py-6 space-y-4">
              <h3 className="font-bricolage font-semibold text-xl text-ink">
                {t.howItWorks.steps[2].title}
              </h3>
              <p className="text-sm text-mist leading-relaxed">
                {t.howItWorks.steps[2].desc}
              </p>

              {/* Simulación mensaje WhatsApp */}
              <div className="p-3.5 bg-paper border border-ink/25 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-mint font-bold">
                  <BellRing className="w-4 h-4 text-mint" />
                  <span>Recordatorio 24h & 2h</span>
                </div>
                <p className="text-xs text-mist">
                  {t.howItWorks.steps[2].note}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-dashed border-ink/20 flex items-center justify-between text-[11px] font-mono text-mist">
              <span>PASO 03 / 03</span>
              <span className="text-mint font-bold">CERO NO-SHOWS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
