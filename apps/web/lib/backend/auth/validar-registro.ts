import { NextResponse } from "next/server";

export interface DatosRegistroValidados {
  normalizedEmail: string;
  password: string;
  nombres: string;
  apellidos: string;
  nombreComercial: string;
  giroComercial: string;
  customSlug?: string;
  telefonoNormalizado: string;
  rolNormalizado: string;
  sucursalesEstimadas: string;
  ciudad: string;
  termsVersion: string;
  privacyVersion: string;
}

const ROLES_PERMITIDOS = new Set(["Dueño", "Gerente", "Recepcionista", "Otro"]);

function isLegalUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function validarPayloadRegistro(
  body: Record<string, unknown>,
): DatosRegistroValidados | NextResponse {
  const {
    email,
    password,
    confirmarPassword,
    nombres,
    apellidos,
    nombreComercial,
    giroComercial,
    slug: customSlug,
    aceptaTerminos,
    aceptaPrivacidad,
    termsVersionAccepted,
    privacyVersionAccepted,
    telefono,
    rol,
    sucursales,
    ciudad,
  } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json(
      { success: false, error: "Se requiere un correo electrónico válido." },
      { status: 400 },
    );
  }

  if (!password || typeof password !== "string" || password.length < 12) {
    return NextResponse.json(
      { success: false, error: "La contraseña debe tener al menos 12 caracteres." },
      { status: 400 },
    );
  }

  if (!nombreComercial || typeof nombreComercial !== "string" || nombreComercial.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "El nombre comercial del negocio es obligatorio." },
      { status: 400 },
    );
  }

  if (!giroComercial || typeof giroComercial !== "string" || giroComercial.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "El giro comercial del negocio es obligatorio." },
      { status: 400 },
    );
  }

  if (typeof nombres !== "string" || !nombres.trim() || nombres.trim().length > 100) {
    return NextResponse.json(
      { success: false, ok: false, error: "Se requieren los nombres del administrador (máximo 100 caracteres)." },
      { status: 400 },
    );
  }

  if (typeof apellidos !== "string" || !apellidos.trim() || apellidos.trim().length > 100) {
    return NextResponse.json(
      { success: false, ok: false, error: "Se requieren los apellidos del administrador (máximo 100 caracteres)." },
      { status: 400 },
    );
  }

  const telefonoNormalizado =
    typeof telefono === "string" && telefono.trim().startsWith("+")
      ? `+${telefono.replace(/\D/g, "")}`
      : "";
  if (!/^\+[1-9][0-9]{1,14}$/.test(telefonoNormalizado)) {
    return NextResponse.json(
      { success: false, ok: false, error: "Se requiere un teléfono internacional válido (+...)." },
      { status: 400 },
    );
  }

  const rolNormalizado = typeof rol === "string" ? rol.trim() : "";
  if (!ROLES_PERMITIDOS.has(rolNormalizado)) {
    return NextResponse.json(
      { success: false, ok: false, error: "El rol de registro no es válido." },
      { status: 400 },
    );
  }

  const sucursalesEstimadas = sucursales === "2-3" ? "2–3" : sucursales;
  if (typeof sucursalesEstimadas !== "string" || !["1", "2–3", "4+"].includes(sucursalesEstimadas)) {
    return NextResponse.json(
      { success: false, ok: false, error: "La cantidad estimada de sucursales no es válida." },
      { status: 400 },
    );
  }

  if (typeof ciudad !== "string" || !ciudad.trim() || ciudad.trim().length > 120) {
    return NextResponse.json(
      { success: false, ok: false, error: "Se requiere una ciudad válida (máximo 120 caracteres)." },
      { status: 400 },
    );
  }

  if (confirmarPassword !== password) {
    return NextResponse.json(
      { success: false, ok: false, error: "Las contraseñas no coinciden." },
      { status: 400 },
    );
  }

  if (aceptaTerminos !== true || aceptaPrivacidad !== true) {
    return NextResponse.json(
      { success: false, ok: false, error: "Debes aceptar los Términos de Servicio y el Aviso de Privacidad." },
      { status: 400 },
    );
  }

  const termsUrl = process.env.NEXT_PUBLIC_TERMS_URL || "/terminos";
  const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_URL || "/privacidad";
  const termsVersion = process.env.NEXT_PUBLIC_TERMS_VERSION || "v1";
  const privacyVersion = process.env.NEXT_PUBLIC_PRIVACY_VERSION || "v1";
  if (!isLegalUrl(termsUrl) || !isLegalUrl(privacyUrl)) {
    return NextResponse.json(
      { success: false, ok: false, error: "El registro no está disponible temporalmente." },
      { status: 503 },
    );
  }
  if (termsVersionAccepted !== termsVersion || privacyVersionAccepted !== privacyVersion) {
    return NextResponse.json(
      { success: false, ok: false, error: "Los documentos legales cambiaron. Recarga la página y vuelve a revisarlos." },
      { status: 409 },
    );
  }

  return {
    normalizedEmail: email.trim().toLowerCase(),
    password,
    nombres: nombres.trim(),
    apellidos: apellidos.trim(),
    nombreComercial: nombreComercial.trim(),
    giroComercial: giroComercial.trim(),
    customSlug:
      typeof customSlug === "string" && customSlug.trim().length > 0
        ? customSlug
        : undefined,
    telefonoNormalizado,
    rolNormalizado,
    sucursalesEstimadas,
    ciudad: ciudad.trim(),
    termsVersion,
    privacyVersion,
  };
}
