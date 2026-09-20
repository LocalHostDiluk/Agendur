"use client";

import React from "react";
import { Building2, CalendarCheck, CircleDollarSign, MessageCircleMore } from "lucide-react";
import { useLandingLanguage } from "./LandingLanguageContext";

const shapes = [
  "lg:row-span-2 [clip-path:polygon(0_0,100%_0,100%_calc(100%_-_42px),calc(100%_-_42px)_100%,0_100%)]",
  "[clip-path:polygon(0_0,calc(100%_-_32px)_0,100%_32px,100%_100%,0_100%)] bg-flame",
  "relative bg-mint after:absolute after:right-0 after:top-0 after:h-10 after:w-10 after:rounded-bl-full after:bg-grape",
  "lg:col-span-2 [clip-path:polygon(32px_0,100%_0,100%_100%,0_100%,0_32px)]",
];

export function FeaturesSection() {
  const { lang, t } = useLandingLanguage();
  const cards = [
    [t.features.big.title, t.features.big.subtitle, CalendarCheck],
    [t.features.cards[0].title, t.features.cards[0].desc, Building2],
    [t.features.cards[1].title, t.features.cards[1].desc, MessageCircleMore],
    [t.features.cards[2].title, t.features.cards[2].desc, CircleDollarSign],
  ] as const;

  return <section id="diferenciadores" className="bg-grape py-20 text-paper lg:py-28"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mb-10 max-w-3xl md:mb-14"><p className="mb-4 text-xs font-bold text-flame">{lang === "es" ? "Hecho para operar" : "Made to run your business"}</p><h2 className="font-bricolage text-5xl font-bold leading-[.98] tracking-tight sm:text-6xl lg:text-7xl">{lang === "es" ? "Todo cae en su lugar." : "Everything falls into place."}</h2></div><div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr_.8fr] lg:grid-rows-2">{cards.map(([title, desc, Icon], index) => <article key={title} className={`flex min-h-[280px] flex-col justify-between bg-paper p-8 text-ink ${shapes[index]}`}><div className="flex items-start justify-between gap-4"><span className="grid size-12 place-items-center rounded-full border-2 border-current"><Icon className="size-6" aria-hidden="true" /></span><span className="text-sm">0{index + 1}</span></div><div className="mt-12"><h3 className="font-bricolage text-2xl font-semibold leading-tight sm:text-3xl">{title}</h3><div className="my-5 border-t-2 border-dashed border-current opacity-40" /><p className="max-w-xl leading-relaxed opacity-75">{desc}</p></div></article>)}</div></div></section>;
}
