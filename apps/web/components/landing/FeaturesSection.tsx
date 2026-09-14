"use client";

import React from "react";
import { useLandingLanguage } from "./LandingLanguageContext";
import {
  ExternalLink,
  Layers,
  MessageSquare,
  CreditCard,
  Clock,
} from "lucide-react";

export function FeaturesSection() {
  const { t } = useLandingLanguage();

  return (
    <section
      id="diferenciadores"
      className="relative bg-paper text-ink py-20 lg:py-28 border-b-2 border-ink"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame/10 border border-flame text-flame text-xs font-mono font-semibold">
            <span>{t.features.badge}</span>
          </div>
          <h2 className="font-bricolage font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink">
            {t.features.title}
          </h2>
          <p className="text-mist text-base sm:text-lg font-normal">
            {t.features.subtitle}
          </p>
        </div>

        {/* Bento Asimétrico: 1 Grande + 3 Medianos */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Bloque Grande (col-span-12 lg:col-span-7): Tu negocio, tu link */}
          {/* Forma: ticket-chamfer-tr (esquina diagonal cortada) */}
          <div className="lg:col-span-7 bg-white border-2 border-ink p-7 sm:p-9 flex flex-col justify-between ticket-chamfer-tr relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-ink/15">
                <span className="inline-block px-2.5 py-1 bg-grape text-paper text-xs font-mono font-bold">
                  {t.features.big.tag}
                </span>
                <span className="text-xs font-mono text-mist">
                  LINK DIRECTO
                </span>
              </div>

              <h3 className="font-bricolage font-bold text-2xl sm:text-3xl text-ink">
                {t.features.big.title}
              </h3>
              <p className="text-mist text-sm sm:text-base leading-relaxed max-w-xl">
                {t.features.big.subtitle}
              </p>

              {/* Barra de URL simulación navegador tipo ticket */}
              <div className="pt-2">
                <div className="bg-paper border-2 border-ink p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-ink">
                    <span className="w-2.5 h-2.5 rounded-full bg-flame shrink-0" />
                    <span className="font-bold text-grape truncate">
                      {t.features.big.url}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-ink shrink-0" />
                </div>
              </div>

              {/* Vista previa de tarjeta de servicio para el cliente */}
              <div className="p-4 bg-paper/60 border border-ink/20 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-bricolage font-semibold text-sm text-ink">
                    {t.features.big.previewService}
                  </span>
                  <span className="text-xs font-mono font-bold text-mint">
                    DISPONIBLE HOY
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-mist">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {t.features.big.previewDuration}
                  </span>
                </div>
                <div className="pt-2 flex justify-end">
                  <span className="px-3 py-1.5 bg-ink text-paper text-xs font-medium ticket-notch-tr">
                    {t.features.big.previewAction}
                  </span>
                </div>
              </div>
            </div>

            {/* Separador de perforación inferior */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-ink/20 flex items-center justify-between text-[11px] font-mono text-mist">
              <span>RESPONSIVE 100% MÓVIL</span>
              <span className="text-flame font-bold">SIN INSTALACIÓN</span>
            </div>
          </div>

          {/* Columna Derecha con los 3 Bloques Medianos (col-span-12 lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Mediano 1: Multi-sucursal (esquina cutout perforada circular) */}
            <div className="bg-white border-2 border-ink p-6 ticket-cutout-tr relative flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-grape text-paper flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono text-grape font-bold">
                    {t.features.cards[0].badge}
                  </span>
                </div>
                <h4 className="font-bricolage font-semibold text-lg text-ink pt-1">
                  {t.features.cards[0].title}
                </h4>
                <p className="text-xs sm:text-sm text-mist leading-relaxed">
                  {t.features.cards[0].desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-dashed border-ink/20 flex items-center justify-between text-[10px] font-mono text-mist">
                <span>MATRIZ & FILIALES</span>
                <span className="text-ink font-bold">AGENDA BLINDADA</span>
              </div>
            </div>

            {/* Mediano 2: WhatsApp/SMS (esquinas rectas limpias, sin cortes) */}
            <div className="bg-white border-2 border-ink p-6 relative flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-mint text-paper flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-ink" />
                  </div>
                  <span className="text-xs font-mono text-mint font-bold">
                    {t.features.cards[1].badge}
                  </span>
                </div>
                <h4 className="font-bricolage font-semibold text-lg text-ink pt-1">
                  {t.features.cards[1].title}
                </h4>
                <p className="text-xs sm:text-sm text-mist leading-relaxed">
                  {t.features.cards[1].desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-dashed border-ink/20 flex items-center justify-between text-[10px] font-mono text-mist">
                <span>AUTOMÁTICO 24/7</span>
                <span className="text-mint font-bold">CONFIRMACIÓN 1-CLIC</span>
              </div>
            </div>

            {/* Mediano 3: Anticipos y pagos en línea (esquina achaflanada tl) */}
            <div className="bg-white border-2 border-ink p-6 ticket-chamfer-tl relative flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-flame text-paper flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono text-flame font-bold">
                    {t.features.cards[2].badge}
                  </span>
                </div>
                <h4 className="font-bricolage font-semibold text-lg text-ink pt-1">
                  {t.features.cards[2].title}
                </h4>
                <p className="text-xs sm:text-sm text-mist leading-relaxed">
                  {t.features.cards[2].desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-dashed border-ink/20 flex items-center justify-between text-[10px] font-mono text-mist">
                <span>DEPÓSITOS DIRECTOS</span>
                <span className="text-flame font-bold">CERO CANCELACIÓN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
