export type RangoRapido = "7d" | "30d" | "mes";

// Official rotating palette tokens (§6)
export const PALETA_ROTATIVA = [
  "#6e49a6", // --grape
  "#3f9e76", // --success
  "#e8a23d", // --warning
  "#ff5a36", // --flame
  "#a39c8c", // --text-muted
];

// 1. Ocupación por sucursal (§6: Bar horizontal/vertical con paleta rotativa fija)
export const OCUPACION_SUCURSALES_DATA = [
  { sucursal: "Matriz Centro", ocupacion: 84, citas: 68, color: PALETA_ROTATIVA[0] },
  { sucursal: "Providencia", ocupacion: 76, citas: 48, color: PALETA_ROTATIVA[1] },
  { sucursal: "Valle Oriente", ocupacion: 68, citas: 26, color: PALETA_ROTATIVA[2] },
];

// 2. Servicios más solicitados (§6: Donut con paleta rotativa oficial)
export const SERVICIOS_POPULARES_DATA = [
  { name: "Corte & Estilo", citas: 54, porcentaje: 38, color: PALETA_ROTATIVA[0] },
  { name: "Colorimetría & Mechas", citas: 34, porcentaje: 24, color: PALETA_ROTATIVA[1] },
  { name: "Tratamiento Facial", citas: 26, porcentaje: 18, color: PALETA_ROTATIVA[2] },
  { name: "Masaje Relajante", citas: 17, porcentaje: 12, color: PALETA_ROTATIVA[3] },
  { name: "Manicura & Spa", citas: 11, porcentaje: 8, color: PALETA_ROTATIVA[4] },
];

// 3. Tasa de inasistencias (§6: Área con --danger al 12% de opacidad de relleno, línea sólida)
export const INASISTENCIAS_DATA = [
  { fecha: "1-7 Sep", tasa: 5.2, inasistencias: 4 },
  { fecha: "8-14 Sep", tasa: 4.8, inasistencias: 3 },
  { fecha: "15-21 Sep", tasa: 3.5, inasistencias: 2 },
  { fecha: "22-28 Sep", tasa: 2.8, inasistencias: 2 },
  { fecha: "29-30 Sep", tasa: 2.1, inasistencias: 1 },
];
