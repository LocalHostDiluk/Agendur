"use client";

import React from "react";
import Link from "next/link";
import { useLandingLanguage } from "./LandingLanguageContext";

export function CTASection() {
  const { t } = useLandingLanguage();
  return <section className="bg-ink py-20 text-paper md:py-28"><div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8"><h2 className="mx-auto max-w-4xl font-bricolage text-5xl font-bold leading-[.98] tracking-tight sm:text-6xl md:text-7xl">{t.cta.title}</h2><Link href="/register" className="mt-9 inline-flex bg-flame px-6 py-4 font-semibold text-ink [clip-path:polygon(0_0,100%_0,100%_calc(100%_-_14px),calc(100%_-_14px)_100%,0_100%,0_14px,14px_0)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-flame focus-visible:ring-offset-2 focus-visible:ring-offset-ink">{t.cta.button}</Link></div></section>;
}
