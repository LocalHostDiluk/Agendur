//DJ say: Beneficios header del navs componente para usar 
//como no jala copiar las atiquetas <></>


"use client";

import { useLandingLanguage } from "@/components/landing/LandingLanguageContext";

export function BenefitsHeader() {
    const { t } = useLandingLanguage();

    return (
        <div className="mb-10 max-w-3xl md:mb-14">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-grape">
            {t.benefits.badge}
        </p>
        <h2 className="mt-4 font-bricolage text-4xl font-bold leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl">
            {t.benefits.title}
        </h2>
        <p className="mt-5 text-lg text-mist">{t.benefits.subtitle}</p>
        </div>
    );
}