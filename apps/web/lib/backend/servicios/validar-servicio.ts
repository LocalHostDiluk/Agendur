import { apiError } from "@/lib/utils/api-error";

export function validarNuevoServicio(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return apiError(
      "Campos inválidos: cuerpo de solicitud no válido.",
      undefined,
      { status: 400 },
    );
  }

  const {
    nombre,
    duracion_minutos,
    buffer_minutos = 0,
    precio,
    descripcion,
  } = body as Record<string, unknown>;

  if (
    typeof nombre !== "string" ||
    !nombre.trim() ||
    nombre.trim().length > 120
  ) {
    return apiError(
      "Campos inválidos: el nombre es requerido y no debe superar los 120 caracteres.",
      undefined,
      { status: 400 },
    );
  }

  if (
    typeof duracion_minutos !== "number" ||
    !Number.isInteger(duracion_minutos) ||
    duracion_minutos <= 0
  ) {
    return apiError(
      "Campos inválidos: duracion_minutos debe ser un número entero mayor a 0.",
      undefined,
      { status: 400 },
    );
  }

  if (typeof precio !== "number" || Number.isNaN(precio) || precio < 0) {
    return apiError(
      "Campos inválidos: precio debe ser un número mayor o igual a 0.",
      undefined,
      { status: 400 },
    );
  }

  if (
    typeof buffer_minutos !== "number" ||
    !Number.isInteger(buffer_minutos) ||
    buffer_minutos < 0
  ) {
    return apiError(
      "Campos inválidos: buffer_minutos debe ser un entero mayor o igual a 0.",
      undefined,
      { status: 400 },
    );
  }

  if (
    descripcion !== undefined &&
    descripcion !== null &&
    typeof descripcion !== "string"
  ) {
    return apiError(
      "Campos inválidos: descripcion debe ser una cadena de texto o null.",
      undefined,
      { status: 400 },
    );
  }

  const cleanDescripcion =
    typeof descripcion === "string" ? descripcion.trim() || null : null;

  return { nombre, duracion_minutos, buffer_minutos, precio, cleanDescripcion };
}

export function validarCambiosServicio(body: Record<string, unknown>) {
  const {
    nombre,
    duracion_minutos,
    buffer_minutos,
    precio,
    descripcion,
    activo,
  } = body as Record<string, unknown>;

  const updates: {
    nombre?: string;
    duracion_minutos?: number;
    buffer_minutos?: number;
    precio?: number;
    descripcion?: string | null;
    activo?: boolean;
  } = {};

  if (nombre !== undefined) {
    if (
      typeof nombre !== "string" ||
      !nombre.trim() ||
      nombre.trim().length > 120
    ) {
      return apiError(
        "Campos inválidos: el nombre no debe estar vacío y no debe superar 120 caracteres.",
        undefined,
        { status: 400 },
      );
    }
    updates.nombre = nombre.trim();
  }

  if (duracion_minutos !== undefined) {
    if (
      typeof duracion_minutos !== "number" ||
      !Number.isInteger(duracion_minutos) ||
      duracion_minutos <= 0
    ) {
      return apiError(
        "Campos inválidos: duracion_minutos debe ser un entero positivo.",
        undefined,
        { status: 400 },
      );
    }
    updates.duracion_minutos = duracion_minutos;
  }

  if (buffer_minutos !== undefined) {
    if (
      typeof buffer_minutos !== "number" ||
      !Number.isInteger(buffer_minutos) ||
      buffer_minutos < 0
    ) {
      return apiError(
        "Campos inválidos: buffer_minutos debe ser un entero mayor o igual a 0.",
        undefined,
        { status: 400 },
      );
    }
    updates.buffer_minutos = buffer_minutos;
  }

  if (precio !== undefined) {
    if (typeof precio !== "number" || Number.isNaN(precio) || precio < 0) {
      return apiError(
        "Campos inválidos: precio debe ser un número mayor o igual a 0.",
        undefined,
        { status: 400 },
      );
    }
    updates.precio = precio;
  }

  if (descripcion !== undefined) {
    if (descripcion !== null && typeof descripcion !== "string") {
      return apiError(
        "Campos inválidos: descripcion debe ser texto o null.",
        undefined,
        { status: 400 },
      );
    }
    updates.descripcion =
      typeof descripcion === "string" ? descripcion.trim() || null : null;
  }

  if (activo !== undefined) {
    if (typeof activo !== "boolean") {
      return apiError(
        "Campos inválidos: activo debe ser un valor booleano.",
        undefined,
        { status: 400 },
      );
    }
    updates.activo = activo;
  }

  if (Object.keys(updates).length === 0) {
    return apiError(
      "Campos inválidos: no se enviaron campos válidos para actualizar.",
      undefined,
      { status: 400 },
    );
  }

  return updates;
}
