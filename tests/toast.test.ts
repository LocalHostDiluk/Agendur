import { describe, it, expect } from "bun:test";
import { getHumanErrorMessage } from "@/lib/utils/toast";

describe("Módulo de Notificaciones y Mapeo de Errores Humanos (Toast)", () => {
  it("debería traducir errores de permisos (403/unauthorized) a mensajes claros", () => {
    const res = getHumanErrorMessage(
      "403 Forbidden: No tienes permiso para realizar esta acción",
    );
    expect(res.title).toBe("Acceso denegado");
    expect(res.description).toBe("No tienes permiso para hacer eso.");
  });

  it("debería traducir credenciales incorrectas a mensajes empáticos", () => {
    const res = getHumanErrorMessage("Invalid login credentials");
    expect(res.title).toBe("Credenciales incorrectas");
    expect(res.description).toContain("El correo o la contraseña no coinciden");
  });

  it("debería traducir cuentas duplicadas al registrarse", () => {
    const res = getHumanErrorMessage("User already registered");
    expect(res.title).toBe("Cuenta ya registrada");
    expect(res.description).toContain("Ya existe un negocio registrado");
  });

  it("debería traducir errores de servidor (500 / servidor falló)", () => {
    const res = getHumanErrorMessage("Error 500: Internal Server Error");
    expect(res.title).toBe("El servidor falló");
    expect(res.description).toContain("problema técnico momentáneo");
  });

  it("debería traducir caídas de red o fallos de conexión", () => {
    const res = getHumanErrorMessage("Failed to fetch");
    expect(res.title).toBe("Sin conexión");
    expect(res.description).toContain("No pudimos conectar con el servidor");
  });

  it("debería traducir saturación y rate limiting (429)", () => {
    const res = getHumanErrorMessage("Demasiados intentos. Por favor espera");
    expect(res.title).toBe("Demasiados intentos");
  });

  it("debería traducir fallos de verificación Turnstile / Captcha", () => {
    const res = getHumanErrorMessage("Error de verificación Turnstile");
    expect(res.title).toBe("Verificación de seguridad");
    expect(res.description).toContain("anti-spam");
  });

  it("debería retornar un fallback amigable si el error es nulo o indefinido", () => {
    const res = getHumanErrorMessage(null);
    expect(res.title).toBe("Error");
    expect(res.description).toContain("Ocurrió un problema inesperado");
  });
});
