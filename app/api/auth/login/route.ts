import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { apiError } from "@/lib/utils/api-error";

export async function POST(request: Request) {
  try {
    // Control de Tráfico: Rate Limiting por IP (Máx 10 intentos en 5 minutos)
    if (process.env.NODE_ENV !== "test") {
      const rateLimit = await checkRateLimit(request, {
        limit: 10,
        windowMs: 5 * 60 * 1000,
        keyPrefix: "auth:login",
      });

      if (!rateLimit.success) {
        const retrySeconds = Math.ceil(
          (rateLimit.resetTime - Date.now()) / 1000,
        );
        return NextResponse.json(
          {
            success: false,
            ok: false,
            error: `Demasiados intentos de acceso desde esta conexión. Por favor espera ${Math.ceil(retrySeconds / 60)} minuto(s).`,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(retrySeconds),
              "X-RateLimit-Limit": String(rateLimit.limit),
              "X-RateLimit-Remaining": String(rateLimit.remaining),
            },
          },
        );
      }
    }

    const body = await request.json();
    const { email, password } = body;

    // 1. Validaciones
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "El correo electrónico y la contraseña son obligatorios.",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // 2. Autenticar credenciales
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Credenciales inválidas. Verifica tu correo y contraseña.",
        },
        { status: 401 },
      );
    }

    // 3. Consultar datos del negocio del usuario
    const admin = createAdminClient();
    const { data: negocio, error: negocioError } = await admin
      .from("negocios")
      .select("id, nombre_comercial, slug, giro_comercial, logo_url")
      .eq("owner_id", authData.user.id)
      .maybeSingle();

    if (negocioError) {
      Sentry.captureException(negocioError);
    }

    // 4. Consultar suscripción activa
    let suscripcion = null;
    if (negocio?.id) {
      const { data: subData } = await admin
        .from("suscripciones")
        .select(
          "plan_nombre, estado, current_period_end, limite_sucursales, limite_profesionales",
        )
        .eq("negocio_id", negocio.id)
        .maybeSingle();

      suscripcion = subData;
    }

    return NextResponse.json({
      success: true,
      ok: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      negocio: negocio
        ? {
            id: negocio.id,
            nombreComercial: negocio.nombre_comercial,
            slug: negocio.slug,
            giroComercial: negocio.giro_comercial,
            logoUrl: negocio.logo_url,
          }
        : null,
      suscripcion,
    });
  } catch (error) {
    return apiError(error, "Error inesperado al iniciar sesión.", {
      extra: { route: "POST /api/auth/login" },
    });
  }
}
