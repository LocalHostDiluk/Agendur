import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * Endpoint de intercambio de código PKCE de autenticación.
 * Se ejecuta cuando el usuario hace clic en el enlace de confirmación enviado a su correo por Resend.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");

  // Prevenir Open Redirect: permitir solo rutas relativas seguras
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/dashboard";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      Sentry.captureException(error);
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  // Si hay error en el código de verificación o expiró, redirigir a login con aviso
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
