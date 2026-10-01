//DJ say: el contenedor principal de los componentes
//como no jala copiar las atiquetas <></>

"use client";

import React from "react";
import { BenefitsCTA } from "./BenefitsCTA";
import { BenefitsGrid } from "./BenefitsGrid";
import { BenefitsHeader } from "./BenefitsHeader";

export function BenefitsSection({ id = "beneficios" }: { id?: string }) {
    return (
        <section id={id} className="bg-paper py-20 text-ink lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <BenefitsHeader />
            <BenefitsGrid />
            <BenefitsCTA />
        </div>
        </section>
    );
}