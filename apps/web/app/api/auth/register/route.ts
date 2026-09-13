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

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, ok: false, error: "Solicitud de registro inválida." },
        { status: 400 },
      );
    }
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

    if (!password || typeof password !== "string" || password.length < 12) {
      return NextResponse.json(
        {
          success: false,
          error: "La contraseña debe tener al menos 12 caracteres.",
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

    const termsUrl = process.env.NEXT_PUBLIC_TERMS_URL;
    const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_URL;
    const termsVersion = process.env.NEXT_PUBLIC_TERMS_VERSION;
    const privacyVersion = process.env.NEXT_PUBLIC_PRIVACY_VERSION;
    const isHttpsUrl = (value?: string) => {
      if (!value) return false;
      try {
        return new URL(value).protocol === "https:";
      } catch {
        return false;
      }
    };
    if (!isHttpsUrl(termsUrl) || !isHttpsUrl(privacyUrl) || !termsVersion?.trim() || !privacyVersion?.trim()) {
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

    const supabase = await createClient();
    const admin = createAdminClient();

    const schemaChecks = await Promise.all([
      admin.from("perfiles_usuario").select("usuario_id").limit(1),
      admin.from("consentimientos_usuario").select("id").limit(1),
      admin.from("negocios").select("id,pais,zona_horaria").limit(1),
    ]);
    if (schemaChecks.some((result) => result.error)) {
      Sentry.captureException(schemaChecks.find((result) => result.error)?.error);
      return NextResponse.json(
        { success: false, ok: false, error: "El registro no está disponible temporalmente." },
        { status: 503 },
      );
    }

    // 2. Determinar slug único
    const baseSlug =
      customSlug &&
      typeof customSlug === "string" &&
      customSlug.trim().length > 0
        ? generateSlug(customSlug)
        : generateSlug(nombreComercial);

    // Verificar si el slug ya existe
    const { data: existingSlug, error: slugError } = await admin
      .from("negocios")
      .select("id")
      .eq("slug", baseSlug)
      .maybeSingle();

    if (slugError) {
      Sentry.captureException(slugError);
      return NextResponse.json(
        { success: false, ok: false, error: "El registro no está disponible temporalmente." },
        { status: 503 },
      );
    }

    const finalSlug = existingSlug
      ? `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`
      : baseSlug;

    // 3. Registrar usuario en Supabase Auth con Resend Custom SMTP
    const callbackUrl = new URL("/api/auth/callback", request.url).toString();

    const normalizedEmail = email.trim().toLowerCase();
    const registrationNonce = crypto.randomUUID();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: callbackUrl,
        data: { registration_nonce: registrationNonce },
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

    const signedUpUser = authData.user;
    // Supabase también puede devolver una identidad para una cuenta previa no confirmada.
    // Sólo una cuenta creada en esta llamada recibe este nonce en user_metadata.
    const isNewEmailIdentity = signedUpUser.user_metadata?.registration_nonce === registrationNonce &&
      signedUpUser.email?.toLowerCase() === normalizedEmail &&
      signedUpUser.identities?.some((identity) =>
        identity.provider === "email" && identity.user_id === signedUpUser.id,
      );
    if (!isNewEmailIdentity) {
      return NextResponse.json(
        {
          success: false,
          ok: false,
          error:
            "Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.",
        },
        { status: 400 },
      );
    }

    const userId = signedUpUser.id;

    const failProvisioning = async (cause: unknown) => {
      Sentry.captureException(cause);
      const { error: rollbackError } = await admin.auth.admin.deleteUser(userId);
      if (rollbackError) Sentry.captureException(rollbackError);
      return NextResponse.json(
        { success: false, ok: false, error: "No se pudo completar el registro. Por favor intenta de nuevo." },
        { status: 500 },
      );
    };

    // Los tres registros comparten el usuario; su eliminación revierte las FK en cascada.
    const { error: profileError } = await admin.from("perfiles_usuario").insert({
      usuario_id: userId,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
    });
    const { error: consentError } = profileError
      ? { error: null }
      : await admin.from("consentimientos_usuario").insert([
          { usuario_id: userId, documento: "terminos_servicio", version: termsVersion },
          { usuario_id: userId, documento: "aviso_privacidad", version: privacyVersion },
        ]);
    const { data: negocio, error: negocioError } = profileError || consentError
      ? { data: null, error: null }
      : await admin.from("negocios").insert({
          owner_id: userId,
          nombre_comercial: nombreComercial.trim(),
          slug: finalSlug,
          giro_comercial: giroComercial.trim(),
          moneda_principal: "MXN",
          porcentaje_anticipo_default: 0,
        }).select().single();

    if (profileError || consentError || negocioError || !negocio) {
      return failProvisioning(profileError || consentError || negocioError || new Error("Negocio no creado"));
    }

    // Crear la suscripción inicial (Trial 14 días)
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
      return failProvisioning(subError);
    }

    const needsEmailConfirmation = !authData.session;

    return NextResponse.json(
      {
        success: true,
        ok: true,
        needsEmailConfirmation,
        onboardingStatus: "required",
        user: {
          id: signedUpUser.id,
          email: signedUpUser.email,
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
    const isDev = process.env.NODE_ENV === "development";
    const message =
      isDev && error instanceof Error
        ? error.message
        : "Error interno del servidor. Por favor intenta de nuevo más tarde.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
