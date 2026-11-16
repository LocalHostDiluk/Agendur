import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSlug } from "@/lib/utils/slug";
import type { DatosRegistroValidados } from "./validar-registro";

export async function registrarCuenta(
  input: DatosRegistroValidados,
  callbackUrl: string,
): Promise<NextResponse> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const baseSlug = input.customSlug
    ? generateSlug(input.customSlug)
    : generateSlug(input.nombreComercial);

  const { data: existingSlug, error: slugError } = await admin
    .from("negocios")
    .select("id")
    .eq("slug", baseSlug)
    .maybeSingle();

  if (slugError) {
    Sentry.captureException(slugError);
    return NextResponse.json(
      {
        success: false,
        ok: false,
        error: "El registro no está disponible temporalmente.",
      },
      { status: 503 },
    );
  }

  const finalSlug = existingSlug
    ? `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`
    : baseSlug;

  const registrationNonce = crypto.randomUUID();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.normalizedEmail,
    password: input.password,
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
  const isNewEmailIdentity =
    signedUpUser.user_metadata?.registration_nonce === registrationNonce &&
    signedUpUser.email?.toLowerCase() === input.normalizedEmail &&
    signedUpUser.identities?.some(
      (identity) =>
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

  const failProvisioning = async (cause: unknown, negocioId?: string) => {
    Sentry.captureException(cause);

    if (negocioId) {
      const { error: negocioCleanupError } = await admin
        .from("negocios")
        .delete()
        .eq("id", negocioId)
        .eq("owner_id", userId);

      if (negocioCleanupError) {
        Sentry.captureException(negocioCleanupError);
        return NextResponse.json(
          {
            success: false,
            ok: false,
            error:
              "No se pudo completar el registro. Por favor intenta de nuevo.",
          },
          { status: 500 },
        );
      }
    }

    const { error: rollbackError } = await admin.auth.admin.deleteUser(userId);
    if (rollbackError) Sentry.captureException(rollbackError);
    return NextResponse.json(
      {
        success: false,
        ok: false,
        error: "No se pudo completar el registro. Por favor intenta de nuevo.",
      },
      { status: 500 },
    );
  };

  // Perfil y consentimientos se revierten al eliminar el usuario; si ya existe,
  // el negocio se elimina primero para respetar la FK restrictiva.
  const { error: profileError } = await admin.from("perfiles_usuario").insert({
    usuario_id: userId,
    nombres: input.nombres,
    apellidos: input.apellidos,
    telefono: input.telefonoNormalizado,
  });
  const { error: consentError } = profileError
    ? { error: null }
    : await admin.from("consentimientos_usuario").insert([
        {
          usuario_id: userId,
          documento: "terminos_servicio",
          version: input.termsVersion,
        },
        {
          usuario_id: userId,
          documento: "aviso_privacidad",
          version: input.privacyVersion,
        },
      ]);
  const { data: negocio, error: negocioError } =
    profileError || consentError
      ? { data: null, error: null }
      : await admin
          .from("negocios")
          .insert({
            owner_id: userId,
            nombre_comercial: input.nombreComercial,
            slug: finalSlug,
            giro_comercial: input.giroComercial,
            ciudad: input.ciudad,
            sucursales_estimadas: input.sucursalesEstimadas,
            moneda_principal: "MXN",
            porcentaje_anticipo_default: 0,
          })
          .select()
          .single();

  if (profileError || consentError || negocioError || !negocio) {
    return failProvisioning(
      profileError ||
        consentError ||
        negocioError ||
        new Error("Negocio no creado"),
    );
  }

  // Crear la suscripción inicial (Trial 14 días)
  const trialEnd = new Date(
    Date.now() + 14 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { error: subError } = await admin.from("suscripciones").insert({
    negocio_id: negocio.id,
    plan_nombre: "starter",
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
    return failProvisioning(subError, negocio.id);
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
        ciudad: negocio.ciudad,
        sucursalesEstimadas: negocio.sucursales_estimadas,
      },
    },
    { status: 201 },
  );
}
