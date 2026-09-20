"use client";

import React, { useState } from "react";
import { useLandingLanguage } from "./LandingLanguageContext";

export function FAQSection() {
  const { t } = useLandingLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return <section id="faq" className="bg-flame py-20 text-ink lg:py-28"><div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8"><div><p className="mb-4 text-xs font-bold">{t.faq.badge}</p><h2 className="font-bricolage text-5xl font-bold leading-[.98] tracking-tight sm:text-6xl">{t.faq.title}</h2><p className="mt-5 max-w-md leading-relaxed text-ink/75">{t.faq.subtitle}</p></div><div className="border-t-2 border-ink">{t.faq.items.map((item, index) => { const isOpen = openIndex === index; const answerId = `faq-answer-${index}`; return <div key={item.q} className="border-b-2 border-ink"><button type="button" onClick={() => setOpenIndex(isOpen ? null : index)} aria-expanded={isOpen} aria-controls={answerId} className="flex w-full items-center justify-between gap-6 py-6 text-left font-bricolage text-xl font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-flame"><span>{item.q}</span><span aria-hidden="true" className={`relative grid size-11 shrink-0 place-items-center rounded-full border-2 border-current transition-transform ${isOpen ? "rotate-45" : ""}`}><span className="h-0.5 w-4 bg-current" /><span className="absolute h-4 w-0.5 bg-current" /></span></button>{isOpen && <p id={answerId} className="max-w-2xl pb-6 pr-16 leading-relaxed">{item.a}</p>}</div>; })}</div></div></section>;
}
