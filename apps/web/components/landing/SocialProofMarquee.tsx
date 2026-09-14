"use client";

import React from "react";
import { useLandingLanguage } from "./LandingLanguageContext";
import { Quote, Star } from "lucide-react";

export function SocialProofMarquee() {
  const { t } = useLandingLanguage();

  return (
    <section className="relative bg-ink text-paper py-20 lg:py-28 border-b-2 border-ink overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Franja de Métricas Destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-16 border-b border-paper/15">
          {t.socialProof.metrics.map((metric, i) => (
            <div
              key={i}
              className="p-6 bg-paper/5 border border-paper/15 text-center flex flex-col items-center justify-center ticket-notch-tr"
            >
              {/* Cifras en Bricolage Grotesque (Space Mono es exclusivo del contador del Hero) */}
              <span className="font-bricolage font-bold text-4xl sm:text-5xl text-flame tracking-tight">
                {metric.value}
              </span>
              <span className="text-sm font-medium text-paper/80 mt-2">
                {metric.label}
              </span>
            </div>
          ))}
        </div>

        {/* 2. Tres Testimonios en Tarjetas Tipo Ticket con Esquina Rasgada/Perforada */}
        <div className="pt-16 pb-16">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h3 className="font-bricolage font-bold text-2xl sm:text-3xl text-paper">
              Dueños de negocio que ya no persiguen clientes
            </h3>
            <p className="text-mist text-sm sm:text-base">
              Experiencias reales en mostrador todos los días.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.socialProof.testimonials.map((item, index) => (
              <div
                key={index}
                className="relative bg-paper text-ink p-7 border-2 border-ink flex flex-col justify-between ticket-cutout-tr shadow-none"
              >
                {/* Cabecera de boleto con ticketNo */}
                <div className="flex items-center justify-between pb-3 border-b border-ink/15">
                  <div className="flex items-center gap-1 text-flame">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        className="w-3.5 h-3.5 fill-flame text-flame"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold text-mist bg-ink/5 px-2 py-0.5">
                    {item.ticketNo}
                  </span>
                </div>

                {/* Cita */}
                <div className="py-5">
                  <p className="text-sm text-ink/90 italic leading-relaxed">
                    "{item.quote}"
                  </p>
                </div>

                {/* Perforación interna de ticket */}
                <div className="my-2 border-t-2 border-dashed border-ink/20" />

                {/* Info del cliente */}
                <div className="pt-3 flex items-center gap-3">
                  {/* Avatar tipográfico con iniciales */}
                  <div className="w-10 h-10 rounded-full bg-grape text-paper flex items-center justify-center font-bold text-sm shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bricolage font-bold text-sm text-ink truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-mist truncate">
                      {item.role} · {item.business}
                    </p>
                    <span className="text-[11px] font-mono text-grape block">
                      {item.city}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Franja de Logos de Clientes */}
        <div className="pt-8 border-t border-paper/15 text-center">
          <span className="text-xs font-mono text-mist uppercase tracking-wider block mb-6">
            Confían en Agendur en todo México y Latinoamérica
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {t.socialProof.clientLogos.map((client, c) => (
              <div
                key={c}
                className="px-4 py-2 bg-paper/5 border border-paper/10 text-paper/70 font-bricolage font-semibold text-sm tracking-wide hover:text-paper hover:border-paper/30 transition-colors"
              >
                {client}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
