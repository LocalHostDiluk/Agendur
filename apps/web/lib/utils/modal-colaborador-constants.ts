export interface ColaboradorCreadoPayload {
  id: string;
  nombre: string;
  apellido: string;
  sucursal_id: string;
  email: string;
  telefono: string;
  serviciosIds: string[];
  rol: string;
  hora_inicio: string;
  hora_fin: string;
  dias_laborables: number[];
  activo: boolean;
}

export const COLABORADOR_ROLES = [
  { value: "Especialista", label: "Especialista / Profesional" },
  { value: "Recepcionista", label: "Recepcionista / Atención" },
  { value: "Administrador", label: "Administrador / Gerente" },
  { value: "Asistente", label: "Asistente / Apoyo" },
];

export const COLABORADOR_DIAS_SEMANA = [
  { dia: 1, label: "Lun" },
  { dia: 2, label: "Mar" },
  { dia: 3, label: "Mié" },
  { dia: 4, label: "Jue" },
  { dia: 5, label: "Vie" },
  { dia: 6, label: "Sáb" },
  { dia: 0, label: "Dom" },
];

export const COLABORADOR_HORAS_OPCIONES = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00",
];
