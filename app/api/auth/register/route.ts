import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSlug } from "@/lib/utils/slug";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, nombreComercial, giroComercial, slug: customSlug, telefono } = body;

    // 1. Validaciones de campos requeridos
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Se requiere un correo electrónico válido." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    if (!nombreComercial || typeof nombreComercial !== "string" || nombreComercial.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "El nombre comercial del negocio es obligatorio." },
        { status: 400 }
      );
    }

    if (!giroComercial || typeof giroComercial !== "string" || giroComercial.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "El giro comercial del negocio es obligatorio." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    // 2. Determinar slug único
    const baseSlug = customSlug && typeof customSlug === "string" && customSlug.trim().length > 0
      ? generateSlug(customSlug)
      : generateSlug(nombreComercial);

    // Verificar si el slug ya existe
    const { data: existingSlug } = await admin
      .from("negocios")
      .select("id")
      .eq("slug", baseSlug)
      .maybeSingle();

    const finalSlug = existingSlug ? `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}` : baseSlug;

    // 3. Registrar usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_comercial: nombreComercial,
          telefono: telefono || null,
        },
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: authError?.message || "No se pudo registrar el usuario." },
        { status: 400 }
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
      return NextResponse.json(
        { success: false, error: "Usuario creado, pero hubo un error al inicializar el negocio." },
        { status: 500 }
      );
    }

    // 5. Crear la sucursal matriz inicial por defecto
    const { error: sucursalError } = await admin
      .from("sucursales")
      .insert({
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
    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const { error: subError } = await admin
      .from("suscripciones")
      .insert({
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

    return NextResponse.json(
      {
        success: true,
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
      { status: 201 }
    );
  } catch (error) {
    Sentry.captureException(error);
    const message = error instanceof Error ? error.message : "Error inesperado en el servidor.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

