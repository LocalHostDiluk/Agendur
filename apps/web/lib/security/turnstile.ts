/**
 * Módulo de Verificación de Cloudflare Turnstile en el Servidor.
 * Valida los tokens generados por el widget contra la API oficial de Cloudflare:
 * https://challenges.cloudflare.com/turnstile/v0/siteverify
 */

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

// Claves oficiales de prueba de Cloudflare (Siempre pasan en local/desarrollo)
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
export const TURNSTILE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

export async function verifyTurnstileToken(
  token: string | undefined | null,
  clientIp?: string,
): Promise<{ success: boolean; error?: string }> {
  // En desarrollo, si no se envió token y no hay secreto configurado, permitir si está en desarrollo
  const secretKey =
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || TURNSTILE_TEST_SECRET_KEY;

  if (!token || typeof token !== "string" || token.trim().length === 0) {
    // Si estamos usando la clave de prueba y no hay token, requerir el widget
    return {
      success: false,
      error: "Por favor completa la verificación de seguridad anti-spam.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      },
    );

    if (!response.ok) {
      return {
        success: false,
        error:
          "Error al comunicarse con el servicio de verificación anti-spam.",
      };
    }

    const data = (await response.json()) as TurnstileVerifyResponse;

    if (!data.success) {
      const errorCodes = data["error-codes"]?.join(", ") || "token_invalido";
      return {
        success: false,
        error: `Fallo en la verificación anti-spam (${errorCodes}). Por favor intenta de nuevo.`,
      };
    }

    return { success: true };
  } catch {
    // Mensaje fijo: el detalle técnico de la excepción viajaba al cliente.
    return {
      success: false,
      error: "Error al comunicarse con el servicio de verificación anti-spam.",
    };
  }
}
