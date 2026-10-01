import { describe, expect, it } from "bun:test";
import { parseSpecialSchedule } from "@/app/api/negocio/horarios-especiales/route";

describe("horarios especiales", () => {
  it("acepta múltiples bloques y rechaza bloques solapados", () => {
    expect(parseSpecialSchedule({
      tipo: "profesional",
      recursoId: "11111111-1111-4111-8111-111111111111",
      fecha: "2030-01-15",
      cerrado: false,
      motivo: "Horario reducido",
      bloques: [
        { inicio: "09:00", fin: "12:00" },
        { inicio: "14:00", fin: "17:00" },
      ],
    })).toEqual({
      tipo: "profesional",
      recursoId: "11111111-1111-4111-8111-111111111111",
      fecha: "2030-01-15",
      cerrado: false,
      motivo: "Horario reducido",
      bloques: [
        { inicio: "09:00", fin: "12:00" },
        { inicio: "14:00", fin: "17:00" },
      ],
    });

    expect(parseSpecialSchedule({
      tipo: "sucursal",
      recursoId: "11111111-1111-4111-8111-111111111111",
      fecha: "2030-01-15",
      cerrado: false,
      bloques: [
        { inicio: "09:00", fin: "13:00" },
        { inicio: "12:00", fin: "17:00" },
      ],
    })).toBeNull();
  });

  it("representa el cierre completo sin bloques", () => {
    expect(parseSpecialSchedule({
      tipo: "sucursal",
      recursoId: "11111111-1111-4111-8111-111111111111",
      fecha: "2030-01-15",
      cerrado: true,
      motivo: "Festivo",
      bloques: [],
    })?.cerrado).toBe(true);
  });
});
