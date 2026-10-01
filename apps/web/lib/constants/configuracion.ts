import type { NegocioConfig } from "@/lib/types";

export type ConfigType = Omit<NegocioConfig, "whatsappNotificaciones"> & {
  id?: string;
  monedaPrincipal?: string;
  logoUrl?: string | null;
};

export type ConfigTab =
  | "perfil"
  | "politicas"
  | "usuarios"
  | "plantillas"
  | "suscripcion"
  | "plan"
  | "facturacion";

export const GIROS_FRECUENTES = [
  "Barbería / Peluquería masculina",
  "Estética / Salón de belleza",
  "Spa / Masajes y bienestar",
  "Consultorio médico / Especialidades",
  "Clínica dental / Odontología",
  "Salón de manicura / Uñas",
  "Estudio de tatuajes y piercings",
  "Fitness / Personal Trainer / Yoga",
  "Nutrición y Dietética",
  "Veterinaria / Cuidado de mascotas",
  "Servicios profesionales / Consultoría",
  "Otro rubro comercial",
];

export const PAISES = [
  { code: "MX", name: "México" },
  { code: "CO", name: "Colombia" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "PE", name: "Perú" },
  { code: "ES", name: "España" },
  { code: "US", name: "Estados Unidos" },
  { code: "UY", name: "Uruguay" },
  { code: "EC", name: "Ecuador" },
];

export const ZONAS_HORARIAS = [
  { value: "America/Mexico_City", label: "Ciudad de México / Centro (GMT-6)" },
  { value: "America/Monterrey", label: "Monterrey (GMT-6)" },
  { value: "America/Cancun", label: "Cancún / Quintana Roo (GMT-5)" },
  { value: "America/Tijuana", label: "Tijuana / Pacífico (GMT-8)" },
  { value: "America/Hermosillo", label: "Hermosillo / Sonora (GMT-7)" },
  { value: "America/Bogota", label: "Bogotá / Colombia (GMT-5)" },
  { value: "America/Lima", label: "Lima / Perú (GMT-5)" },
  { value: "America/Santiago", label: "Santiago / Chile (GMT-4)" },
  { value: "America/Buenos_Aires", label: "Buenos Aires / Argentina (GMT-3)" },
  { value: "Europe/Madrid", label: "Madrid / España (GMT+1)" },
  { value: "America/New_York", label: "Nueva York / Miami (GMT-5)" },
  { value: "America/Los_Angeles", label: "Los Ángeles (GMT-8)" },
];

export const MONEDAS = [
  { code: "MXN", label: "MXN ($) — Peso Mexicano" },
  { code: "USD", label: "USD ($) — Dólar Estadounidense" },
  { code: "EUR", label: "EUR (€) — Euro" },
  { code: "COP", label: "COP ($) — Peso Colombiano" },
  { code: "ARS", label: "ARS ($) — Peso Argentino" },
  { code: "CLP", label: "CLP ($) — Peso Chileno" },
  { code: "PEN", label: "PEN (S/) — Sol Peruano" },
];

export const ANTICIPACIONES_MINIMAS = [
  { value: "30m", label: "30 minutos de anticipación" },
  { value: "1h", label: "1 hora de anticipación" },
  { value: "2h", label: "2 horas de anticipación (Recomendado)" },
  { value: "4h", label: "4 horas de anticipación" },
  { value: "12h", label: "12 horas de anticipación" },
  { value: "24h", label: "24 horas de anticipación" },
];

export const ANTICIPACIONES_MAXIMAS = [
  { value: "15d", label: "Hasta 15 días en el futuro" },
  { value: "30d", label: "Hasta 30 días en el futuro (Recomendado)" },
  { value: "60d", label: "Hasta 60 días en el futuro" },
  { value: "90d", label: "Hasta 90 días en el futuro" },
];
