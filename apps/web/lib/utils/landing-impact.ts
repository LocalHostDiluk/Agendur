export type IndustryKey = "belleza" | "salud" | "bienestar";

export interface IndustryData {
  title: string;
  subtitle: string;
  noShowManual: number;
  noShowAgendur: number;
  noShowDiff: string;
  hoursManual: number;
  hoursAgendur: number;
  hoursDiff: string;
  afterHoursManual: number;
  afterHoursAgendur: number;
  afterHoursDiff: string;
  monthlyRoi: string;
  roiDescription: string;
}

export const LANDING_IMPACT_INDUSTRIES: Record<IndustryKey, IndustryData> = {
  belleza: {
    title: "Belleza & Barbería",
    subtitle: "Peluquerías, Barber Shops, Salones y Estilistas",
    noShowManual: 24,
    noShowAgendur: 3.2,
    noShowDiff: "-85% ausentismo",
    hoursManual: 18,
    hoursAgendur: 0.5,
    hoursDiff: "+17.5 hrs ahorradas",
    afterHoursManual: 0,
    afterHoursAgendur: 38,
    afterHoursDiff: "38% agendadas de noche",
    monthlyRoi: "$1,250 USD",
    roiDescription:
      "Recuperados al mes en cortes no perdidos y tiempo del personal",
  },
  salud: {
    title: "Salud & Clínicas",
    subtitle: "Consultorios Médicos, Clínicas Dentales y Fisioterapia",
    noShowManual: 28,
    noShowAgendur: 4.1,
    noShowDiff: "-85% ausentismo",
    hoursManual: 22,
    hoursAgendur: 1.0,
    hoursDiff: "+21 hrs ahorradas",
    afterHoursManual: 0,
    afterHoursAgendur: 42,
    afterHoursDiff: "42% agendadas de noche",
    monthlyRoi: "$2,400 USD",
    roiDescription:
      "En consultas médicas confirmadas con anticipo y cero horas muertas",
  },
  bienestar: {
    title: "Bienestar & Spas",
    subtitle: "Centros de Masaje, Spas, Tatuajes y Terapias",
    noShowManual: 22,
    noShowAgendur: 2.8,
    noShowDiff: "-87% ausentismo",
    hoursManual: 16,
    hoursAgendur: 0.5,
    hoursDiff: "+15.5 hrs ahorradas",
    afterHoursManual: 0,
    afterHoursAgendur: 35,
    afterHoursDiff: "35% agendadas de noche",
    monthlyRoi: "$1,600 USD",
    roiDescription:
      "Asegurados mediante depósitos de reserva y recordatorios puntuales",
  },
};
