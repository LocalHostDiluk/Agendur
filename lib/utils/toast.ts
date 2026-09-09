import { sileo, type SileoOptions } from "sileo";

/**
 * Mapea errores técnicos (HTTP, excepciones, red, Supabase) a títulos y descripciones
 * comprensibles, empáticas y claras para el usuario final.
 */
export function getHumanErrorMessage(
  error: unknown,
  fallbackMessage = "Ocurrió un problema inesperado. Por favor intenta de nuevo.",
): { title: string; description: string } {
  if (!error) {
    return { title: "Error", description: fallbackMessage };
  }

  const rawMessage =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : String(error);

  const lower = rawMessage.toLowerCase();

  // 1. Permisos y autorización (401, 403)
  if (
    lower.includes("no tienes permiso") ||
    lower.includes("unauthorized") ||
    lower.includes("forbidden") ||
    lower.includes("403")
  ) {
    return {
      title: "Acceso denegado",
      description: "No tienes permiso para hacer eso.",
    };
  }

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("credenciales inválidas") ||
    lower.includes("contraseña incorrecta")
  ) {
    return {
      title: "Credenciales incorrectas",
      description:
        "El correo o la contraseña no coinciden. Verifica tus datos.",
    };
  }

  // 2. Errores de Cuenta Existente o Registro
  if (
    lower.includes("ya existe una cuenta") ||
    lower.includes("already registered") ||
    lower.includes("user already registered")
  ) {
    return {
      title: "Cuenta ya registrada",
      description:
        "Ya existe un negocio registrado con este correo. Inicia sesión o recupera tu cuenta.",
    };
  }

  // 3. Rate Limiting y saturación (429)
  if (
    lower.includes("demasiados intentos") ||
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    lower.includes("429")
  ) {
    return {
      title: "Demasiados intentos",
      description:
        "Has realizado muchas peticiones seguidas. Espera unos minutos antes de reintentar.",
    };
  }

  // 4. Fallos de Seguridad / Turnstile
  if (
    lower.includes("turnstile") ||
    lower.includes("captcha") ||
    lower.includes("seguridad")
  ) {
    return {
      title: "Verificación de seguridad",
      description:
        "No se pudo completar la verificación anti-spam. Intenta enviar el formulario nuevamente.",
    };
  }

  // 5. Fallos de Conexión y Red
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network error") ||
    lower.includes("fetch failed") ||
    lower.includes("conexión")
  ) {
    return {
      title: "Sin conexión",
      description:
        "No pudimos conectar con el servidor. Revisa tu conexión a internet.",
    };
  }

  // 6. Servidor caído / 500
  if (
    lower.includes("500") ||
    lower.includes("internal server error") ||
    lower.includes("servidor falló")
  ) {
    return {
      title: "El servidor falló",
      description:
        "Tuvimos un problema técnico momentáneo en nuestros servidores. Inténtalo en un momento.",
    };
  }

  // 7. Errores de validación de campos específicos
  if (lower.includes("contraseña") && lower.includes("6 caracteres")) {
    return {
      title: "Contraseña muy corta",
      description: "Tu contraseña debe tener al menos 6 caracteres.",
    };
  }

  return {
    title: "Atención",
    description: rawMessage.length < 120 ? rawMessage : fallbackMessage,
  };
}

/**
 * API unificada de notificaciones Sileo:
 * Errores humanizados, alertas, tips informativos, confirmaciones de éxito y acciones.
 */
export const notify = {
  /** Notificación de error con traducción automática a lenguaje humano y botón de cierre */
  error(
    error: unknown,
    fallbackDescription?: string,
    options?: Partial<SileoOptions>,
  ) {
    const { title, description } = getHumanErrorMessage(
      error,
      fallbackDescription,
    );
    const toastId = `err-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    return sileo.error({
      title,
      description,
      button: options?.button ?? {
        title: "Cerrar",
        onClick: () => sileo.dismiss(toastId),
      },
      ...options,
    });
  },

  /** Alerta de advertencia para validaciones o límites con botón de cierre */
  warning(
    title: string,
    description?: string,
    options?: Partial<SileoOptions>,
  ) {
    const toastId = `warn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    return sileo.warning({
      title,
      description,
      button:
        options?.button ??
        (description
          ? {
              title: "Cerrar",
              onClick: () => sileo.dismiss(toastId),
            }
          : undefined),
      ...options,
    });
  },

  /** Tips, avisos o información relevante del sistema */
  info(title: string, description?: string, options?: Partial<SileoOptions>) {
    const toastId = `info-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    return sileo.info({
      title,
      description,
      button:
        options?.button ??
        (description
          ? {
              title: "Cerrar",
              onClick: () => sileo.dismiss(toastId),
            }
          : undefined),
      ...options,
    });
  },

  /** Confirmación de operaciones exitosas */
  success(
    title: string,
    description?: string,
    options?: Partial<SileoOptions>,
  ) {
    const toastId = `ok-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    return sileo.success({
      title,
      description,
      button:
        options?.button ??
        (description
          ? {
              title: "Cerrar",
              onClick: () => sileo.dismiss(toastId),
            }
          : undefined),
      ...options,
    });
  },

  /** Notificación interactiva con botón de acción */
  action(
    title: string,
    description: string,
    button: { title: string; onClick: () => void },
    options?: Partial<SileoOptions>,
  ) {
    return sileo.action({
      title,
      description,
      button,
      ...options,
    });
  },

  /** Notificación encadenada a una promesa asíncrona */
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    options: {
      loading: SileoOptions;
      success: SileoOptions | ((data: T) => SileoOptions);
      error: SileoOptions | ((err: unknown) => SileoOptions);
    },
  ) {
    return sileo.promise(promise, options);
  },

  /** Cerrar notificación manualmente por ID */
  dismiss(id: string) {
    sileo.dismiss(id);
  },

  /** Limpiar todas las notificaciones */
  clear() {
    sileo.clear();
  },
};
