"use client";

import React, { useState } from "react";
import { useLandingLanguage } from "./LandingLanguageContext";

export function FAQSection() {
  const { t } = useLandingLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="relative bg-paper text-ink py-20 lg:py-28 border-b-2 border-ink"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabecera */}
        <div className="text-center mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-grape/10 border border-grape text-grape text-xs font-mono font-semibold">
            <span>{t.faq.badge}</span>
          </div>
          <h2 className="font-bricolage font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink">
            {t.faq.title}
          </h2>
          <p className="text-mist text-base sm:text-lg font-normal">
            {t.faq.subtitle}
          </p>
        </div>

        {/* Acordeón con marcador circular tipo sello que rota */}
        <div className="space-y-4">
          {t.faq.items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="bg-white border-2 border-ink overflow-hidden transition-all ticket-chamfer-tr"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-6 sm:p-7 flex items-center justify-between gap-4 focus:outline-hidden"
                  aria-expanded={isOpen}
                >
                  <span className="font-bricolage font-semibold text-lg sm:text-xl text-ink leading-snug">
                    {item.q}
                  </span>

                  {/* Marcador Circular tipo Sello que Rota al Abrir (NO flecha genérica) */}
                  <div
                    className={`w-9 h-9 shrink-0 rounded-full border-2 border-ink flex items-center justify-center font-mono font-bold text-sm transition-transform duration-300 ${
                      isOpen
                        ? "bg-flame text-paper rotate-90"
                        : "bg-paper text-ink rotate-0"
                    }`}
                  >
                    <span className="leading-none">{isOpen ? "—" : "+"}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-7 sm:px-7 text-mist text-sm sm:text-base leading-relaxed border-t border-dashed border-ink/20 pt-4">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
