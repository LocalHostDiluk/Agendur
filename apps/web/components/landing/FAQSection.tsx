"use client";

import React from "react";
import { useLandingLanguage } from "./LandingLanguageContext";

export function FAQSection() {
  const { t } = useLandingLanguage();

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="faq-accordion landing-section-deferred bg-flame py-20 text-ink lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
        <div>
          <p className="mb-4 text-xs font-bold">{t.faq.badge}</p>
          <h2
            id="faq-heading"
            className="font-bricolage text-5xl font-bold leading-[.98] tracking-tight text-balance sm:text-6xl"
          >
            {t.faq.title}
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-ink/75 text-pretty">
            {t.faq.subtitle}
          </p>
        </div>

        <div className="border-t-2 border-ink">
          {t.faq.items.map((item, index) => (
            <details
              key={item.q}
              open={index === 0}
              className="group border-b-2 border-ink"
            >
              <summary className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left font-bricolage text-xl font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-flame">
                <span>{item.q}</span>
                <span
                  aria-hidden="true"
                  className="relative grid size-11 shrink-0 place-items-center rounded-full border-2 border-current transition-transform group-open:rotate-45"
                >
                  <span className="h-0.5 w-4 bg-current" />
                  <span className="absolute h-4 w-0.5 bg-current" />
                </span>
              </summary>
              <p className="max-w-2xl pb-6 pr-16 leading-relaxed text-pretty">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
