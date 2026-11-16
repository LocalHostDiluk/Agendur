import type { Metadata } from "next";
import { LegalDraftShell, type LegalSectionItem } from "@/components/landing/LegalDraftShell";
import { LegalTermsServiceAndPlans } from "@/components/landing/LegalTermsServiceAndPlans";
import { LegalTermsConductAndLaw } from "@/components/landing/LegalTermsConductAndLaw";

export const metadata: Metadata = {
  title: "Términos y Condiciones de Uso | Agendur",
  description:
    "Condiciones legales que regulan el acceso y uso de la plataforma SaaS de gestión de citas, sucursales y reservas en línea de Agendur.",
  robots: { index: false, follow: false },
};

const SECTIONS: LegalSectionItem[] = [
  { id: "operador", label: "1. Identidad del Operador y Aceptación" },
  { id: "servicio", label: "2. Descripción del Servicio SaaS" },
  { id: "cuentas", label: "3. Cuentas Administradoras, Seguridad y Roles" },
  { id: "planes", label: "4. Planes, Prueba Gratuita de 14 Días y Facturación" },
  { id: "citas-y-anticipos", label: "5. Relación entre Negocios y Clientes Finales" },
  { id: "uso-aceptable", label: "6. Uso Aceptable y Conductas Prohibidas" },
  { id: "disponibilidad", label: "7. Disponibilidad, Monitoreo y Limitación de Responsabilidad" },
  { id: "jurisdiccion", label: "8. Legislación Aplicable y Jurisdicción" },
];

export default function TermsPage() {
  return (
    <LegalDraftShell
      title="Términos y Condiciones de Uso"
      subtitle="Condiciones que regulan el acceso y uso de la plataforma SaaS de gestión de citas, sucursales y reservas en línea de Agendur."
      activeDoc="terminos"
      sections={SECTIONS}
    >
      <LegalTermsServiceAndPlans />
      <LegalTermsConductAndLaw />
    </LegalDraftShell>
  );
}
