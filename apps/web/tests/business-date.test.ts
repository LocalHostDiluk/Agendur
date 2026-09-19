import { describe, expect, it } from "bun:test";
import { getBusinessToday, isCalendarDate } from "@/lib/utils/business-date";

describe("Fecha local del negocio", () => {
  it("usa el día de la zona del negocio, no el día UTC", () => {
    const instant = new Date("2026-09-13T05:30:00.000Z");
    expect(getBusinessToday("America/Monterrey", instant)).toBe("2026-09-12");
    expect(getBusinessToday("UTC", instant)).toBe("2026-09-13");
  });

  it("no inventa el día cuando falta o es inválida la zona", () => {
    expect(getBusinessToday(null, new Date())).toBeNull();
    expect(getBusinessToday("zona-invalida", new Date())).toBeNull();
  });
});

describe("isCalendarDate", () => {
  it("rechaza fechas con formato válido pero inexistentes en el calendario", () => {
    expect(isCalendarDate("2026-02-28")).toBe(true);
    expect(isCalendarDate("2026-02-31")).toBe(false);
    expect(isCalendarDate("2027-02-29")).toBe(false);
    expect(isCalendarDate("9999-99-99")).toBe(false);
    expect(isCalendarDate("2026/09/08")).toBe(false);
    expect(isCalendarDate(20260908)).toBe(false);
  });
});
