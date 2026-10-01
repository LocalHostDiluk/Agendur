// archivo de cards como referencia base de dj, mañana le continuo
// page.tsx

import type { Metadata } from "next";
import { BenefitsSection } from "@/components/beneficios";
import { Footer } from "@/components/landing/Footer";
import { LandingLanguageProvider } from "@/components/landing/LandingLanguageContext";
import { Navbar } from "@/components/landing/Navbar";

export const metadata: Metadata = {
    title: "Beneficios | Agendur",
    description:"Agenda sin empalmes, catálogo con precio, autoservicio del cliente, roles por persona e historial que no se pierde.",
};

export default function BeneficiosPage() {
    return (
        <LandingLanguageProvider>
        <div className="flex min-h-screen flex-col bg-paper text-ink">
            <Navbar />
            <main className="flex-1">
            <BenefitsSection />
            </main>
            <Footer />
        </div>
        </LandingLanguageProvider>
    );
}