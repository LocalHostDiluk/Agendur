interface ErrorRule {
  matches: (lower: string) => boolean;
  title: string;
  description: string;
}

const ERROR_RULES: ErrorRule[] = [
  {
    matches: (l) =>
      l.includes("no tienes permiso") ||
      l.includes("unauthorized") ||
      l.includes("forbidden") ||
      l.includes("403"),
    title: "Acceso denegado",
    description: "No tienes permiso para hacer eso.",
  },
  {
    matches: (l) =>
      l.includes("invalid login credentials") ||
      l.includes("credenciales inválidas") ||
      l.includes("contraseña incorrecta"),
    title: "Credenciales incorrectas",
    description: "El correo o la contraseña no coinciden. Verifica tus datos.",
  },
  {
    matches: (l) =>
      l.includes("ya existe una cuenta") ||
      l.includes("already registered") ||
      l.includes("user already registered"),
    title: "Cuenta ya registrada",
    description:
      "Ya existe un negocio registrado con este correo. Inicia sesión o recupera tu cuenta.",
  },
  {
    matches: (l) =>
      l.includes("demasiados intentos") ||
      l.includes("rate limit") ||
      l.includes("too many requests") ||
      l.includes("429"),
    title: "Demasiados intentos",
    description:
      "Has realizado muchas peticiones seguidas. Espera unos minutos antes de reintentar.",
  },
  {
    matches: (l) =>
      l.includes("turnstile") || l.includes("captcha") || l.includes("seguridad"),
    title: "Verificación de seguridad",
    description:
      "No se pudo completar la verificación anti-spam. Intenta enviar el formulario nuevamente.",
  },
  {
    matches: (l) =>
      l.includes("failed to fetch") ||
      l.includes("network error") ||
      l.includes("fetch failed") ||
      l.includes("conexión"),
    title: "Sin conexión",
    description:
      "No pudimos conectar con el servidor. Revisa tu conexión a internet.",
  },
  {
    matches: (l) =>
      l.includes("500") ||
      l.includes("internal server error") ||
      l.includes("servidor falló"),
    title: "El servidor falló",
    description:
      "Tuvimos un problema técnico momentáneo en nuestros servidores. Inténtalo en un momento.",
  },
  {
    matches: (l) => l.includes("contraseña") && l.includes("6 caracteres"),
    title: "Contraseña muy corta",
    description: "Tu contraseña debe tener al menos 6 caracteres.",
  },
];

export function getHumanErrorMessage(
  error: unknown,
  fallbackMessage = "Ocurrió un problema inesperado. Por favor intenta de nuevo.",
): { title: string; description: string } {
  if (!error) return { title: "Error", description: fallbackMessage };
  const rawMessage =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : String(error);
  const lower = rawMessage.toLowerCase();
  const matched = ERROR_RULES.find((r) => r.matches(lower));
  if (matched) return { title: matched.title, description: matched.description };
  return {
    title: "Atención",
    description: rawMessage.length < 120 ? rawMessage : fallbackMessage,
  };
}
