//DJ say: La wea para los lenguajes que usan
//como no jala copiar las atiquetas <></>

"use client";

import Link from "next/link";
import { useLandingLanguage } from "@/components/landing/LandingLanguageContext";

export function BenefitsCTA() {
    const { t } = useLandingLanguage();

    return (
        <div className="mt-14 border-t-2 border-dashed border-ink/40 pt-10 text-center">
        <Link
            href="/register"
            className="inline-flex bg-ink px-6 py-4 font-semibold text-paper [clip-path:polygon(0_0,100%_0,100%_calc(100%_-_14px),calc(100%_-_14px)_100%,0_100%,0_14px,14px_0)] hover:-translate-y-0.5"
        >
            {t.nav.cta}
        </Link>
        </div>
    );
}