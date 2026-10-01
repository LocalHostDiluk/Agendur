import { describe, expect, it } from "bun:test";
import {
  buildUniformProfessionalSchedule,
  parseProfessionalSchedule,
} from "@/lib/schedules/professional";

describe("horarios semanales de profesionales", () => {
  it("convierte los días elegidos por el modal en el contrato del backend", () => {
    expect(buildUniformProfessionalSchedule([6, 1, 3], "09:00", "18:00")).toEqual([
      { dia_semana: 1, hora_inicio: "09:00", hora_fin: "18:00" },
      { dia_semana: 3, hora_inicio: "09:00", hora_fin: "18:00" },
      { dia_semana: 6, hora_inicio: "09:00", hora_fin: "18:00" },
    ]);
  });

  it("rechaza días duplicados, horas inválidas e intervalos invertidos", () => {
    expect(parseProfessionalSchedule([
      { dia_semana: 1, hora_inicio: "09:00", hora_fin: "18:00" },
      { dia_semana: 1, hora_inicio: "10:00", hora_fin: "17:00" },
    ])).toBeNull();
    expect(parseProfessionalSchedule([
      { dia_semana: 2, hora_inicio: "9:00", hora_fin: "18:00" },
    ])).toBeNull();
    expect(parseProfessionalSchedule([
      { dia_semana: 3, hora_inicio: "18:00", hora_fin: "09:00" },
    ])).toBeNull();
  });
});
