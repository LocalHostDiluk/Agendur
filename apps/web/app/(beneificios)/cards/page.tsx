// archivo de cards como referencia base de dj, mañana le continuo
// cards/page.tsx

import type { Metadata } from "next";
import { BenefitsGrid } from "@/components/beneficios";
import { Footer } from "@/components/landing/Footer";
import { LandingLanguageProvider } from "@/components/landing/LandingLanguageContext";
import { Navbar } from "@/components/landing/Navbar";

export const metadata: Metadata = {
    title: "Beneficios · Cards | Agendur",
};

export default function BeneficiosCardsPage() {
    return (
        <LandingLanguageProvider>
        <div className="flex min-h-screen flex-col bg-paper text-ink">
            <Navbar />
            <main className="flex-1 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <BenefitsGrid />
            </div>
            </main>
            <Footer />
        </div>
        </LandingLanguageProvider>
    );
}