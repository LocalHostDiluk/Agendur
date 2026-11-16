"use client";

import { Apple, BellRing, Building2, Scissors, Share2, Sparkles, Stethoscope, Store } from "lucide-react";
import { useLandingLanguage } from "./LandingLanguageContext";

export function HowItWorksSection() {
  const { lang, t } = useLandingLanguage();
  const industryIcons = [Stethoscope, Scissors, Sparkles, Apple, Store, Building2];
  const copy =
    lang === "es"
      ? {
          eyebrow: "01 / Así de simple",
          title: "Abre. Comparte. Atiende.",
          industries: "Industrias compatibles",
          reminder: "Recordatorios 24 h y 2 h",
        }
      : {
          eyebrow: "01 / Simple as that",
          title: "Open. Share. Serve.",
          industries: "Supported industries",
          reminder: "24 h and 2 h reminders",
        };

  return (
    <section id="como-funciona" className="landing-section-deferred bg-paper py-20 text-ink lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl md:mb-14">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-grape">
            {copy.eyebrow}
          </p>
          <h2 className="mt-4 font-bricolage text-4xl font-bold leading-[0.98] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            <span className="sr-only">{t.howItWorks.title}: </span>
            {copy.title}
          </h2>
          <p className="mt-5 text-lg text-mist text-pretty">{t.howItWorks.subtitle}</p>
        </div>

        <ol role="list" className="grid border-y-2 border-ink md:grid-cols-3 list-none p-0 m-0">
          {t.howItWorks.steps.map((step, index) => {
            const numberClass =
              index === 0 ? "bg-grape text-paper" : index === 1 ? "bg-flame text-ink" : "bg-mint text-ink";
            return (
              <li
                key={step.title}
                className="border-ink p-7 last:border-b-0 md:p-9 md:not-last:border-r-2"
              >
                <span
                  className={`inline-flex size-11 items-center justify-center rounded-full font-mono text-sm font-bold ${numberClass}`}
                >
                  0{index + 1}
                </span>
                <h3 className="mt-10 font-bricolage text-2xl font-semibold leading-tight text-balance">
                  {step.title}
                </h3>
                <p className="mt-4 leading-relaxed text-mist text-pretty">{step.desc}</p>

                {index === 0 && (
                  <div className="mt-7 flex flex-wrap gap-2" aria-label={copy.industries}>
                    {industryIcons.map((Icon, iconIndex) => (
                      <span
                        key={iconIndex}
                        className="flex size-9 items-center justify-center border border-ink/25 bg-paper text-grape"
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        <span className="sr-only">{step.industries?.[iconIndex]}</span>
                      </span>
                    ))}
                  </div>
                )}

                {index === 1 && (
                  <div className="mt-7 border border-ink/25 bg-paper p-3">
                    <div className="flex items-center gap-2 font-mono text-sm font-bold">
                      <Share2 className="size-4 text-flame" aria-hidden="true" />
                      tunegocio.agendur.app
                    </div>
                    <p className="mt-2 text-sm text-mist text-pretty">{step.note}</p>
                  </div>
                )}
                {index === 2 && (
                  <div className="mt-7 border border-ink/25 bg-paper p-3">
                    <div className="flex items-center gap-2 font-mono text-sm font-bold text-mint">
                      <BellRing className="size-4" aria-hidden="true" />
                      {copy.reminder}
                    </div>
                    <p className="mt-2 text-sm text-mist text-pretty">{step.note}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
