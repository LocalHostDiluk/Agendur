import { NextResponse } from "next/server";
import { apiError } from "@/lib/utils/api-error";
import type {
  ValidatedCreateProfesional,
  ValidatedUpdateProfesional,
} from "./types";

/**
 * Valida y sanitiza los campos para la creación de un nuevo profesional.
 */
export function validateCreatePayload(
  body: unknown,
  sucursalIds: string[],
): { ok: false; error: NextResponse } | { ok: true; data: ValidatedCreateProfesional } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      error: apiError(
        "Campos inválidos: cuerpo de solicitud no válido.",
        undefined,
        { status: 400 },
      ),
    };
  }

  const {
    nombre,
    apellido,
    sucursal_id,
    cargo,
    email,
    telefono,
    avatar_url,
    activo = true,
    serviciosIds = [],
  } = body as Record<string, unknown>;

  // Validar nombre
  if (
    typeof nombre !== "string" ||
    !nombre.trim() ||
    nombre.trim().length > 120
  ) {
    return {
      ok: false,
      error: apiError(
        "Campos inválidos: el nombre es requerido y no debe superar los 120 caracteres.",
        undefined,
        { status: 400 },
      ),
    };
  }

  // Validar apellido
  if (
    typeof apellido !== "string" ||
    !apellido.trim() ||
    apellido.trim().length > 120
  ) {
    return {
      ok: false,
      error: apiError(
        "Campos inválidos: el apellido es requerido y no debe superar los 120 caracteres.",
        undefined,
        { status: 400 },
      ),
    };
  }

  // Validar sucursal_id
  if (typeof sucursal_id !== "string" || !sucursal_id.trim()) {
    return {
      ok: false,
      error: apiError(
        "Campos inválidos: sucursal_id es requerida.",
        undefined,
        { status: 400 },
      ),
    };
  }

  const cleanSucursalId = sucursal_id.trim();
  if (!sucursalIds.includes(cleanSucursalId)) {
    return {
      ok: false,
      error: apiError(
        "La sucursal seleccionada no existe o no pertenece a este negocio.",
        undefined,
        { status: 400 },
      ),
    };
  }

  const cleanCargo =
    typeof cargo === "string" && cargo.trim()
      ? cargo.trim().slice(0, 100)
      : "Especialista";

  const cleanEmail =
    typeof email === "string" && email.trim()
      ? email.trim().toLowerCase()
      : null;

  const cleanTelefono =
    typeof telefono === "string" && telefono.trim()
      ? telefono.trim().slice(0, 20)
      : null;

  const cleanAvatarUrl =
    typeof avatar_url === "string" && avatar_url.trim()
      ? avatar_url.trim()
      : null;

  const cleanServiciosIds = Array.isArray(serviciosIds)
    ? serviciosIds.filter((s): s is string => typeof s === "string")
    : [];

  return {
    ok: true,
    data: {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      sucursal_id: cleanSucursalId,
      cargo: cleanCargo,
      email: cleanEmail,
      telefono: cleanTelefono,
      avatar_url: cleanAvatarUrl,
      activo: Boolean(activo),
      serviciosIds: cleanServiciosIds,
    },
  };
}

/**
 * Valida y sanitiza los campos para la actualización de un profesional existente.
 */
export function validateUpdatePayload(
  body: unknown,
  sucursalIds: string[],
): { ok: false; error: NextResponse } | { ok: true; data: ValidatedUpdateProfesional } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      error: apiError(
        "Campos inválidos: cuerpo de solicitud no válido.",
        undefined,
        { status: 400 },
      ),
    };
  }

  const {
    id,
    nombre,
    apellido,
    sucursal_id,
    cargo,
    email,
    telefono,
    avatar_url,
    activo,
    serviciosIds,
  } = body as Record<string, unknown>;

  if (!id || typeof id !== "string" || !id.trim()) {
    return {
      ok: false,
      error: apiError("ID de profesional requerido.", undefined, {
        status: 400,
      }),
    };
  }

  const updates: Record<string, unknown> = {};

  if (nombre !== undefined) {
    if (
      typeof nombre !== "string" ||
      !nombre.trim() ||
      nombre.trim().length > 120
    ) {
      return {
        ok: false,
        error: apiError(
          "El nombre no debe estar vacío ni exceder 120 caracteres.",
          undefined,
          { status: 400 },
        ),
      };
    }
    updates.nombre = nombre.trim();
  }

  if (apellido !== undefined) {
    if (
      typeof apellido !== "string" ||
      !apellido.trim() ||
      apellido.trim().length > 120
    ) {
      return {
        ok: false,
        error: apiError(
          "El apellido no debe estar vacío ni exceder 120 caracteres.",
          undefined,
          { status: 400 },
        ),
      };
    }
    updates.apellido = apellido.trim();
  }

  if (cargo !== undefined) {
    if (cargo !== null && typeof cargo !== "string") {
      return {
        ok: false,
        error: apiError(
          "El cargo debe ser una cadena de texto o null.",
          undefined,
          { status: 400 },
        ),
      };
    }
    updates.cargo =
      typeof cargo === "string" && cargo.trim()
        ? cargo.trim().slice(0, 100)
        : "Especialista";
  }

  if (email !== undefined) {
    if (email !== null && typeof email !== "string") {
      return {
        ok: false,
        error: apiError(
          "El email debe ser una cadena de texto o null.",
          undefined,
          { status: 400 },
        ),
      };
    }
    updates.email =
      typeof email === "string" && email.trim()
        ? email.trim().toLowerCase()
        : null;
  }

  if (telefono !== undefined) {
    if (telefono !== null && typeof telefono !== "string") {
      return {
        ok: false,
        error: apiError("El teléfono debe ser texto o null.", undefined, {
          status: 400,
        }),
      };
    }
    updates.telefono =
      typeof telefono === "string" && telefono.trim()
        ? telefono.trim().slice(0, 20)
        : null;
  }

  if (avatar_url !== undefined) {
    if (avatar_url !== null && typeof avatar_url !== "string") {
      return {
        ok: false,
        error: apiError("avatar_url debe ser texto o null.", undefined, {
          status: 400,
        }),
      };
    }
    updates.avatar_url =
      typeof avatar_url === "string" && avatar_url.trim()
        ? avatar_url.trim()
        : null;
  }

  if (sucursal_id !== undefined) {
    if (
      typeof sucursal_id !== "string" ||
      !sucursalIds.includes(sucursal_id.trim())
    ) {
      return {
        ok: false,
        error: apiError(
          "La sucursal indicada no es válida para este negocio.",
          undefined,
          { status: 400 },
        ),
      };
    }
    updates.sucursal_id = sucursal_id.trim();
  }

  if (activo !== undefined) {
    if (typeof activo !== "boolean") {
      return {
        ok: false,
        error: apiError("activo debe ser un booleano.", undefined, {
          status: 400,
        }),
      };
    }
    updates.activo = activo;
  }

  let incomingServiciosIds: string[] | undefined = undefined;
  if (Array.isArray(serviciosIds)) {
    incomingServiciosIds = serviciosIds.filter(
      (s): s is string => typeof s === "string",
    );
  }

  return {
    ok: true,
    data: {
      id: id.trim(),
      updates,
      incomingServiciosIds,
    },
  };
}
