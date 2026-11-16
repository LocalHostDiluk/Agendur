import type { Metadata } from "next";
import {
  LegalDraftShell,
  type LegalSectionItem,
} from "@/components/landing/LegalDraftShell";
import { LegalPrivacyIntroAndRoles } from "@/components/landing/LegalPrivacyIntroAndRoles";
import { LegalPrivacyDataAndPurposes } from "@/components/landing/LegalPrivacyDataAndPurposes";
import { LegalPrivacyProcessorsAndCookies } from "@/components/landing/LegalPrivacyProcessorsAndCookies";
import { LegalPrivacyArcoAndSecurity } from "@/components/landing/LegalPrivacyArcoAndSecurity";

export const metadata: Metadata = {
  title: "Aviso de Privacidad Integral | Agendur",
  description:
    "Aviso de Privacidad Integral de Agendur conforme a la LFPDPPP: tratamiento de datos personales de titulares de negocios, profesionales y clientes que agendan citas.",
  robots: { index: false, follow: false },
};

const SECTIONS: LegalSectionItem[] = [
  { id: "identidad-y-roles", label: "1. Responsable vs. Encargado" },
  { id: "datos-recabados", label: "2. Datos que Recabamos" },
  { id: "finalidades", label: "3. Finalidades del Tratamiento" },
  { id: "subprocesadores", label: "4. Subprocesadores y Transferencias" },
  { id: "cookies-y-storage", label: "5. Cookies y localStorage" },
  { id: "derechos-arco", label: "6. Derechos ARCO y Revocación" },
  { id: "conservacion-y-seguridad", label: "7. Seguridad y Conservación" },
  { id: "actualizaciones", label: "8. Cambios al Aviso" },
];

export default function PrivacyPage() {
  return (
    <LegalDraftShell
      title="Aviso de Privacidad Integral"
      subtitle="Transparencia sobre qué datos recabamos, con qué finalidad y cómo protegemos la información de negocios, profesionales y clientes conforme a la LFPDPPP."
      activeDoc="privacidad"
      sections={SECTIONS}
    >
      <LegalPrivacyIntroAndRoles />
      <LegalPrivacyDataAndPurposes />
      <LegalPrivacyProcessorsAndCookies />
      <LegalPrivacyArcoAndSecurity />
    </LegalDraftShell>
  );
}
