"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLandingLanguage } from "./LandingLanguageContext";
import {
  Check,
  Scissors,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
} from "lucide-react";

export function HeroSection() {
  const { t } = useLandingLanguage();
  const [ticketNumber, setTicketNumber] = useState(47);

  // ÚNICA animación de entrada orquestada: de 047 a 048 al cargar
  useEffect(() => {
    const timer = setTimeout(() => {
      setTicketNumber(48);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const formattedTicket =
    ticketNumber < 100 ? `0${ticketNumber}` : `${ticketNumber}`;

  return (
    <section className="relative bg-ink text-paper pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Retícula sutil tipo pliego riso (sin gradientes) */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#F3EEDF 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Columna Izquierda: Copy + CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Badge de turno en cabecera */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-grape text-paper text-xs font-mono font-medium border border-paper/20">
              <span className="w-2 h-2 rounded-full bg-flame animate-pulse" />
              <span>{t.hero.ticketLabel}</span>
            </div>

            {/* H1 Principal sin negrita selectiva */}
            <h1 className="font-bricolage font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-paper leading-[1.12]">
              {t.hero.h1}
            </h1>

            {/* Subtítulo */}
            <p className="text-base sm:text-lg lg:text-xl text-mist max-w-2xl font-normal leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* Bloque CTA Primario y Secundario */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex flex-col items-start gap-1.5">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-7 py-4 bg-flame text-paper font-semibold text-base ticket-notch-tr hover:bg-flame/90 active:scale-[0.98] transition-transform focus:outline-hidden focus:ring-2 focus:ring-flame focus:ring-offset-2 focus:ring-offset-ink shadow-none"
                >
                  {t.hero.ctaPrimary}
                </Link>
                <span className="text-xs text-mist font-mono pl-1">
                  {t.hero.ctaNote}
                </span>
              </div>

              <a
                href="#como-funciona"
                className="inline-flex items-center text-sm font-medium text-paper/90 hover:text-paper underline underline-offset-8 decoration-grape decoration-2 hover:decoration-flame transition-colors pt-1"
              >
                {t.hero.secondaryLink}
              </a>
            </div>
          </div>

          {/* Columna Derecha: Ilustración Física del Ticket de Turno */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm sm:max-w-md">
              {/* Sello de Superposición Risográfica (mix-blend-multiply) */}
              <div className="absolute -top-7 -right-5 z-20 flex items-center justify-center pointer-events-none">
                {/* Círculo morado base */}
                <div className="w-24 h-24 rounded-full bg-grape text-paper flex flex-col items-center justify-center border-2 border-ink shadow-none">
                  <span className="text-[10px] uppercase tracking-wider font-mono opacity-80">
                    {t.hero.stampText}
                  </span>
                  {/* Número en Space Mono con animación a 048 */}
                  <span className="font-mono text-2xl font-bold tracking-normal transition-all duration-500">
                    {formattedTicket}
                  </span>
                </div>

                {/* Círculo naranja flame superpuesto con mix-blend-multiply para tono oscuro riso */}
                <div className="absolute -bottom-2 -left-3 w-14 h-14 rounded-full bg-flame text-paper flex items-center justify-center riso-multiply border border-ink opacity-95">
                  <span className="text-[9px] font-mono font-bold">ACTIVO</span>
                </div>
              </div>

              {/* El Ticket Físico en color --paper */}
              <div className="relative bg-paper text-ink border-2 border-ink shadow-none p-6 sm:p-7 overflow-hidden">
                {/* Borde perforado decorativo en el lateral izquierdo */}
                <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col justify-between py-2 -translate-x-1">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-ink -ml-1.5 my-1"
                    />
                  ))}
                </div>

                {/* Cabecera del Ticket */}
                <div className="flex items-center justify-between pb-4 border-b border-ink/15 pl-3">
                  <div>
                    <span className="font-bricolage font-bold text-lg text-ink tracking-tight block">
                      Agendur
                    </span>
                    <span className="text-[11px] font-mono text-mist">
                      SUC-01 · CIUDAD
                    </span>
                  </div>
                  <div className="text-right pr-12">
                    <span className="text-xs font-mono font-medium text-ink bg-paper border border-ink/20 px-2 py-0.5 inline-block">
                      {t.hero.ticketDate}
                    </span>
                  </div>
                </div>

                {/* Detalles de la cita */}
                <div className="py-5 space-y-4 pl-3">
                  <div>
                    <span className="text-xs text-mist block font-mono">
                      Servicio
                    </span>
                    <h3 className="font-bricolage font-semibold text-base text-ink">
                      {t.hero.ticketService}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-mist block font-mono">
                        Especialista
                      </span>
                      <p className="font-medium text-ink">Mateo Silva</p>
                    </div>
                    <div>
                      <span className="text-mist block font-mono">Estado</span>
                      <span className="inline-flex items-center gap-1 text-mint font-semibold bg-mint/10 px-1.5 py-0.5 border border-mint/20">
                        <Check className="w-3 h-3" strokeWidth={2.5} />
                        {t.hero.ticketStatus}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-mist block text-xs font-mono">
                      Depósito
                    </span>
                    <p className="text-xs font-medium text-ink">
                      {t.hero.ticketDeposit}
                    </p>
                  </div>
                </div>

                {/* Línea de corte / perforación punteada con sacabocados laterales */}
                <div className="relative my-2 -mx-7 border-t-2 border-dashed border-ink/25">
                  <div className="absolute -left-3.5 -top-3 w-6 h-6 rounded-full bg-ink" />
                  <div className="absolute -right-3.5 -top-3 w-6 h-6 rounded-full bg-ink" />
                </div>

                {/* Stub inferior del ticket con código de barras riso */}
                <div className="pt-4 pl-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-mist uppercase tracking-wider block">
                      Código de validación
                    </span>
                    {/* Código de barras en líneas sólidas */}
                    <div className="flex items-center gap-[3px] h-7">
                      <div className="w-[3px] h-full bg-ink" />
                      <div className="w-[1px] h-full bg-ink" />
                      <div className="w-[4px] h-full bg-ink" />
                      <div className="w-[2px] h-full bg-ink" />
                      <div className="w-[1px] h-full bg-ink" />
                      <div className="w-[5px] h-full bg-ink" />
                      <div className="w-[2px] h-full bg-ink" />
                      <div className="w-[1px] h-full bg-ink" />
                      <div className="w-[3px] h-full bg-ink" />
                      <div className="w-[4px] h-full bg-ink" />
                      <div className="w-[2px] h-full bg-ink" />
                      <div className="w-[1px] h-full bg-ink" />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold text-grape block">
                      AGENDUR.APP
                    </span>
                    <span className="text-[9px] font-mono text-mist">
                      ID: #AG-8492
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
