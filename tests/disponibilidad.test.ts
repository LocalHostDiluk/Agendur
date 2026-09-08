import { describe, it, expect } from "bun:test";
import { NextRequest } from "next/server";
import {
  timeToMinutes,
  minutesToTime,
  getDiaSemana,
} from "@/lib/backend/reserva-service";
import { GET as disponibilidadHandler } from "@/app/api/cliente/disponibilidad/route";
import { GET as catalogoHandler } from "@/app/api/cliente/catalogo/route";

describe("Motor de Disponibilidad - Utilidades y Lógica Temporal", () => {
  describe("Conversión de Tiempo y Días", () => {
    it("debería convertir correctamente cadenas de tiempo a minutos desde medianoche", () => {
      expect(timeToMinutes("00:00")).toBe(0);
      expect(timeToMinutes("08:30")).toBe(510);
      expect(timeToMinutes("14:45")).toBe(885);
      expect(timeToMinutes("23:59")).toBe(1439);
    });

    it("debería convertir minutos a formato HH:MM con padding de ceros", () => {
      expect(minutesToTime(0)).toBe("00:00");
      expect(minutesToTime(510)).toBe("08:30");
      expect(minutesToTime(885)).toBe("14:45");
      expect(minutesToTime(65)).toBe("01:05");
    });

    it("debería calcular el día de la semana correcto (UTC-safe)", () => {
      // 2026-09-08 es Martes (2)
      expect(getDiaSemana("2026-09-08")).toBe(2);
      // 2026-09-06 es Domingo (0)
      expect(getDiaSemana("2026-09-06")).toBe(0);
      // 2026-09-07 es Lunes (1)
      expect(getDiaSemana("2026-09-07")).toBe(1);
      // 2026-09-12 es Sábado (6)
      expect(getDiaSemana("2026-09-12")).toBe(6);
    });
  });

  describe("Endpoint GET /api/cliente/disponibilidad - Validaciones", () => {
    it("debería retornar 400 si faltan parámetros obligatorios", async () => {
      const req = new NextRequest("http://localhost:3000/api/cliente/disponibilidad?sucursalId=suc-1");
      const res = await disponibilidadHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("son requeridos");
    });

    it("debería retornar 400 si el formato de fecha no es YYYY-MM-DD", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/cliente/disponibilidad?sucursalId=suc-1&servicioId=serv-1&fecha=08-09-2026"
      );
      const res = await disponibilidadHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("YYYY-MM-DD");
    });
  });

  describe("Endpoint GET /api/cliente/catalogo - Validaciones", () => {
    it("debería retornar 400 si no se incluye el parámetro slug", async () => {
      const req = new NextRequest("http://localhost:3000/api/cliente/catalogo");
      const res = await catalogoHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("slug");
    });
  });
});
