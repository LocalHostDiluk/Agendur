"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Clock3, Sparkles } from "lucide-react";
import { useLandingLanguage } from "./LandingLanguageContext";

export function HeroSection() {
  const { lang, t } = useLandingLanguage();
  const [ticketNumber, setTicketNumber] = useState("047");

  useEffect(() => {
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 850;
    const timer = window.setTimeout(() => setTicketNumber("048"), delay);
    return () => window.clearTimeout(timer);
  }, []);

  const copy = lang === "es"
    ? { eyebrow: "Agendur · citas sin vueltas", nowServing: "Ahora atendiendo", yourTurn: "Tu turno", specialist: "Especialista", status: "Confirmado" }
    : { eyebrow: "Agendur · appointments, without the runaround", nowServing: "Now serving", yourTurn: "Your turn", specialist: "Specialist", status: "Confirmed" };

  return (
    <section id="top" className="relative overflow-hidden bg-ink text-paper">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-flame">{copy.eyebrow}</p>
          <h1 className="mt-5 font-bricolage text-5xl font-bold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">{t.hero.h1}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/75 md:text-xl">{t.hero.subtitle}</p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <div>
              <Link href="/register" className="inline-flex bg-flame px-6 py-4 font-semibold text-ink transition-colors hover:bg-flame/90 focus:outline-hidden focus:ring-2 focus:ring-flame focus:ring-offset-2 focus:ring-offset-ink">{t.hero.ctaPrimary}</Link>
              <p className="mt-2 text-center text-xs text-paper/60">{t.hero.ctaNote}</p>
            </div>
            <a href="#como-funciona" className="border-b border-paper/60 pb-1 font-semibold transition-colors hover:border-flame hover:text-flame focus:outline-hidden focus:ring-2 focus:ring-flame">{t.hero.secondaryLink}</a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] py-10">
          <div className="absolute right-2 top-2 size-36 rounded-full bg-grape/85 mix-blend-screen" aria-hidden="true" />
          <div className="absolute bottom-3 left-0 size-24 rounded-full bg-flame/90 mix-blend-screen" aria-hidden="true" />
          <article className="relative mx-auto w-[82%] border-2 border-ink bg-paper p-8 text-ink shadow-[10px_10px_0_#2e2345] md:p-10" aria-label={t.hero.ticketLabel}>
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm font-semibold text-mist">{copy.nowServing}</p><p className="mt-1 font-bricolage text-3xl font-bold">Agendur</p></div>
              <Clock3 className="size-7 text-grape" aria-hidden="true" />
            </div>
            <div className="my-8 border-t-2 border-dashed border-ink/35" />
            <p className="text-center text-sm font-semibold">{copy.yourTurn}</p>
            <p className="mt-2 text-center font-mono text-7xl font-bold leading-none tracking-tight sm:text-8xl">{ticketNumber}</p>
            <div className="my-8 border-t-2 border-dashed border-ink/35" />
            <p className="text-sm font-semibold">{t.hero.ticketService}</p>
            <div className="mt-4 flex items-center justify-between gap-3 text-sm"><span>{copy.specialist}: Mateo Silva</span><span className="inline-flex items-center gap-1.5 font-semibold text-mint"><Check className="size-4" aria-hidden="true" />{t.hero.ticketStatus || copy.status}</span></div>
          </article>
          <div className="absolute bottom-4 right-0 flex size-16 flex-col items-center justify-center rounded-full border-2 border-ink bg-flame text-ink shadow-[4px_4px_0_#17151f]" aria-label={t.hero.stampText}>
            <Sparkles className="size-5" aria-hidden="true" /><span className="text-xs font-bold">24/7</span>
          </div>
        </div>
      </div>
    </section>
  );
}
