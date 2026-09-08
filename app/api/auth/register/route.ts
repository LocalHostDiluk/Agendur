import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSlug } from "@/lib/utils/slug";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

export async function POST(request: Request) {
  try {
    // 0. Control de Tráfico: Rate Limiting por IP (Máx 5 registros en 10 minutos)
    if (process.env.NODE_ENV !== "test") {
      const rateLimit = await checkRateLimit(request, {
        limit: 5,
        windowMs: 10 * 60 * 1000,
        keyPrefix: "auth:register",
      });

      if (!rateLimit.success) {
        const retrySeconds = Math.ceil(
          (rateLimit.resetTime - Date.now()) / 1000,
        );
        return NextResponse.json(
          {
            success: false,
            ok: false,
            error: `Demasiados intentos de registro desde esta conexión. Por favor espera ${Math.ceil(retrySeconds / 60)} minuto(s).`,
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
    const {
      email,
      password,
      nombreComercial,
      giroComercial,
      slug: customSlug,
      telefono,
      turnstileToken,
    } = body;

    // 0.1. Defensa Anti-Spam: Cloudflare Turnstile
    if (process.env.NODE_ENV !== "test") {
      const clientIp = getClientIp(request);
      const turnstile = await verifyTurnstileToken(turnstileToken, clientIp);
      if (!turnstile.success) {
        return NextResponse.json(
          {
            success: false,
            ok: false,
            error:
              turnstile.error ||
              "Por favor completa la verificación de seguridad anti-spam.",
          },
          { status: 400 },
        );
      }
    }

    // 1. Validaciones de campos requeridos
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Se requiere un correo electrónico válido." },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "La contraseña debe tener al menos 6 caracteres.",
        },
        { status: 400 },
      );
    }

    if (
      !nombreComercial ||
      typeof nombreComercial !== "string" ||
      nombreComercial.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "El nombre comercial del negocio es obligatorio.",
        },
        { status: 400 },
      );
    }

    if (
      !giroComercial ||
      typeof giroComercial !== "string" ||
      giroComercial.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "El giro comercial del negocio es obligatorio.",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    // 2. Determinar slug único
    const baseSlug =
      customSlug &&
      typeof customSlug === "string" &&
      customSlug.trim().length > 0
        ? generateSlug(customSlug)
        : generateSlug(nombreComercial);

    // Verificar si el slug ya existe
    const { data: existingSlug } = await admin
      .from("negocios")
      .select("id")
      .eq("slug", baseSlug)
      .maybeSingle();

    const finalSlug = existingSlug
      ? `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`
      : baseSlug;

    // 3. Registrar usuario en Supabase Auth mediante Admin API con email_confirm: true
    // Esto evita invocar el servicio de correo por defecto de Supabase que tiene un límite estricto de 3-4 correos/hora (over_email_send_rate_limit)
    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          nombre_comercial: nombreComercial.trim(),
          telefono: telefono || null,
        },
      });

    if (authError || !authData.user) {
      let errorMessage =
        authError?.message || "No se pudo registrar el usuario.";
      const errorStr = (authError?.message || "").toLowerCase();
      if (
        (authError &&
          "code" in authError &&
          authError.code === "email_exists") ||
        errorStr.includes("already been registered") ||
        errorStr.includes("already registered")
      ) {
        errorMessage =
          "Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.";
      }
      return NextResponse.json(
        { success: false, ok: false, error: errorMessage },
        { status: 400 },
      );
    }

    const userId = authData.user.id;

    // 4. Crear el negocio en la base de datos
    const { data: negocio, error: negocioError } = await admin
      .from("negocios")
      .insert({
        owner_id: userId,
        nombre_comercial: nombreComercial.trim(),
        slug: finalSlug,
        giro_comercial: giroComercial.trim(),
        moneda_principal: "MXN",
        porcentaje_anticipo_default: 0,
      })
      .select()
      .single();

    if (negocioError || !negocio) {
      Sentry.captureException(negocioError);
      // Limpieza defensiva del usuario creado si falló la creación del negocio
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        {
          success: false,
          ok: false,
          error:
            "Usuario creado, pero hubo un error al inicializar el negocio.",
        },
        { status: 500 },
      );
    }

    // 5. Crear la sucursal matriz inicial por defecto
    const { error: sucursalError } = await admin.from("sucursales").insert({
      negocio_id: negocio.id,
      nombre: "Sucursal Principal",
      es_matriz: true,
      direccion: "Dirección Principal",
      ciudad: "Ciudad Principal",
      estado_provincia: "Estado",
      codigo_postal: "00000",
      telefono: telefono || "0000000000",
      zona_horaria: "America/Mexico_City",
      activa: true,
    });

    if (sucursalError) {
      Sentry.captureException(sucursalError);
    }

    // 6. Crear la suscripción inicial (Trial 14 días)
    const trialEnd = new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const { error: subError } = await admin.from("suscripciones").insert({
      negocio_id: negocio.id,
      plan_nombre: "emprendedor",
      intervalo: "mensual",
      limite_sucursales: 1,
      limite_profesionales: 3,
      estado: "trialing",
      pasarela: "manual",
      trial_ends_at: trialEnd,
      current_period_end: trialEnd,
      cancel_at_period_end: false,
      notas_admin: "Periodo de prueba inicial de 14 días",
    });

    if (subError) {
      Sentry.captureException(subError);
    }

    // 7. Iniciar sesión automáticamente en el cliente SSR para establecer cookies de sesión
    try {
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (sessionError) {
      Sentry.captureException(sessionError);
    }

    return NextResponse.json(
      {
        success: true,
        ok: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        negocio: {
          id: negocio.id,
          nombreComercial: negocio.nombre_comercial,
          slug: negocio.slug,
          giroComercial: negocio.giro_comercial,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    Sentry.captureException(error);
    const message =
      error instanceof Error
        ? error.message
        : "Error inesperado en el servidor.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
