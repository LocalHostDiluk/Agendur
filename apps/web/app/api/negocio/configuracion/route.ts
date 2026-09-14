import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertActiveSubscription } from "@/lib/payments/guards";
import { apiError, apiSuccess } from "@/lib/utils/api-error";

/**
 * GET /api/negocio/configuracion
 * Retorna la configuración comercial del negocio del usuario autenticado.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiError("No autorizado. Sesión requerida.", undefined, { status: 401 });
    }

    const { data: negocio, error: negError } = await supabase
      .from("negocios")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (negError || !negocio) {
      return apiError("No se encontró un negocio para esta cuenta.", undefined, { status: 404 });
    }

    return apiSuccess({
      configuracion: {
        id: negocio.id,
        nombreNegocio: negocio.nombre_comercial,
        slug: negocio.slug,
        logoUrl: negocio.logo_url,
        giroComercial: negocio.giro_comercial,
        monedaPrincipal: negocio.moneda_principal,
        pais: negocio.pais ?? null,
        zonaHoraria: negocio.zona_horaria ?? null,
        telefonoClienteRequerido: negocio.telefono_cliente_requerido,
        emailClienteRequerido: negocio.email_cliente_requerido,
        notasClienteHabilitadas: negocio.notas_cliente_habilitadas,
        politicaCancelacion: negocio.politica_cancelacion,
        porcentajeAnticipo: Number(negocio.porcentaje_anticipo_default),
        cobroAnticipoObligatorio: Number(negocio.porcentaje_anticipo_default) > 0,
      },
    });
  } catch (error: unknown) {
    return apiError(error, "Error interno al consultar configuración.", {
      extra: { route: "GET /api/negocio/configuracion" },
    });
  }
}

/**
 * PUT /api/negocio/configuracion
 * Actualiza los parámetros comerciales del negocio autenticado.
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiError("No autorizado. Sesión requerida.", undefined, { status: 401 });
    }

    const { data: negocio, error: negError } = await supabase
      .from("negocios")
      .select("id, telefono_cliente_requerido, email_cliente_requerido")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (negError || !negocio) {
      return apiError("No se encontró un negocio para esta cuenta.", undefined, { status: 404 });
    }

    // Validar que la suscripción no esté vencida (HTTP 402 si expiró)
    await assertActiveSubscription(negocio.id);

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return apiError("Configuración inválida.", undefined, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const updatePayload: Record<string, unknown> = {};

    if (input.nombreNegocio !== undefined) {
      if (typeof input.nombreNegocio !== "string" || !input.nombreNegocio.trim() || input.nombreNegocio.trim().length > 200) {
        return apiError("Nombre de negocio inválido.", undefined, { status: 400 });
      }
      updatePayload.nombre_comercial = input.nombreNegocio.trim();
    }
    if (input.giroComercial !== undefined) {
      if (typeof input.giroComercial !== "string" || !input.giroComercial.trim() || input.giroComercial.trim().length > 200) {
        return apiError("Giro comercial inválido.", undefined, { status: 400 });
      }
      updatePayload.giro_comercial = input.giroComercial.trim();
    }
    if (input.pais !== undefined) {
      if (typeof input.pais !== "string" || !/^[A-Z]{2}$/.test(input.pais)) {
        return apiError("País inválido (código de dos letras).", undefined, { status: 400 });
      }
      updatePayload.pais = input.pais;
    }
    if (input.zonaHoraria !== undefined) {
      if (typeof input.zonaHoraria !== "string" || input.zonaHoraria.length > 60) {
        return apiError("Zona horaria inválida.", undefined, { status: 400 });
      }
      try {
        new Intl.DateTimeFormat("en", { timeZone: input.zonaHoraria });
      } catch {
        return apiError("Zona horaria inválida.", undefined, { status: 400 });
      }
      updatePayload.zona_horaria = input.zonaHoraria;
    }
    if (input.logoUrl !== undefined) updatePayload.logo_url = input.logoUrl;
    if (input.monedaPrincipal !== undefined) updatePayload.moneda_principal = input.monedaPrincipal;
    if (input.porcentajeAnticipo !== undefined) {
      const p = Number(input.porcentajeAnticipo);
      if (isNaN(p) || p < 0 || p > 100) {
        return apiError(
          "El porcentaje de anticipo debe ser entre 0 y 100.",
          undefined,
          { status: 400, code: "INVALID_PERCENTAGE" }
        );
      }
      updatePayload.porcentaje_anticipo_default = p;
    }

    for (const [key, column] of [
      ["telefonoClienteRequerido", "telefono_cliente_requerido"],
      ["emailClienteRequerido", "email_cliente_requerido"],
      ["notasClienteHabilitadas", "notas_cliente_habilitadas"],
    ] as const) {
      if (input[key] !== undefined) {
        if (typeof input[key] !== "boolean") {
          return apiError(`${key} debe ser booleano.`, undefined, { status: 400 });
        }
        updatePayload[column] = input[key];
      }
    }
    if (
      (updatePayload.telefono_cliente_requerido ?? negocio.telefono_cliente_requerido) === false &&
      (updatePayload.email_cliente_requerido ?? negocio.email_cliente_requerido) === false
    ) {
      return apiError("Se requiere al menos un medio de contacto.", undefined, { status: 400 });
    }
    if (input.politicaCancelacion !== undefined) {
      if (input.politicaCancelacion !== null &&
          (typeof input.politicaCancelacion !== "string" || input.politicaCancelacion.length > 2000)) {
        return apiError("Política de cancelación inválida (máximo 2000 caracteres).", undefined, { status: 400 });
      }
      updatePayload.politica_cancelacion = typeof input.politicaCancelacion === "string"
        ? input.politicaCancelacion.trim() || null
        : null;
    }

    const { data: updated, error: updateError } = await supabase
      .from("negocios")
      .update(updatePayload)
      .eq("id", negocio.id)
      .select("*")
      .single();

    if (updateError || !updated) {
      throw updateError || new Error("Error al actualizar");
    }

    return apiSuccess({
      configuracion: {
        id: updated.id,
        nombreNegocio: updated.nombre_comercial,
        slug: updated.slug,
        logoUrl: updated.logo_url,
        giroComercial: updated.giro_comercial,
        monedaPrincipal: updated.moneda_principal,
        pais: updated.pais ?? null,
        zonaHoraria: updated.zona_horaria ?? null,
        telefonoClienteRequerido: updated.telefono_cliente_requerido,
        emailClienteRequerido: updated.email_cliente_requerido,
        notasClienteHabilitadas: updated.notas_cliente_habilitadas,
        politicaCancelacion: updated.politica_cancelacion,
        porcentajeAnticipo: Number(updated.porcentaje_anticipo_default),
        cobroAnticipoObligatorio: Number(updated.porcentaje_anticipo_default) > 0,
      },
    });
  } catch (error: unknown) {
    return apiError(error, "Error al actualizar configuración.", {
      extra: { route: "PUT /api/negocio/configuracion" },
    });
  }
}
