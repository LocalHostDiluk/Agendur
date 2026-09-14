"use client";

import React from "react";
import Link from "next/link";
import { useLandingLanguage } from "./LandingLanguageContext";

export function CTASection() {
  const { t } = useLandingLanguage();

  return (
    <section className="relative bg-ink text-paper py-20 lg:py-28 border-b border-paper/15 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        {/* Cabecera directa y contundente */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 bg-flame text-paper text-xs font-mono font-bold uppercase tracking-wider">
            DECISIÓN
          </span>
          <h2 className="font-bricolage font-bold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-paper leading-[1.1]">
            {t.cta.title}
          </h2>
          <p className="text-mist text-base sm:text-lg max-w-xl mx-auto">
            {t.cta.subtitle}
          </p>
        </div>

        {/* CTA con muesca de ticket recortada en esquina */}
        <div className="pt-2 flex flex-col items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-9 py-4 sm:py-5 bg-flame text-paper font-bold text-base sm:text-lg ticket-notch-tr hover:bg-flame/90 active:scale-[0.98] transition-transform focus:outline-hidden focus:ring-2 focus:ring-flame focus:ring-offset-2 focus:ring-offset-ink"
          >
            {t.cta.button}
          </Link>
          <span className="text-xs text-mist font-mono">{t.cta.note}</span>
        </div>
      </div>
    </section>
  );
}
