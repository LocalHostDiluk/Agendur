import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/utils/api-error";
import {
  getAuthenticatedNegocio,
  getNegocioSucursalesIds,
  validateCreatePayload,
  validateUpdatePayload,
  listarProfesionales,
  crearProfesional,
  actualizarProfesional,
} from "@/lib/backend/profesionales";

/**
 * GET /api/negocio/profesionales
 * Retorna los profesionales del negocio autenticado con sus servicios asignados.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedNegocio();
    if (!auth.ok) return auth.error;

    const sucursalIds = await getNegocioSucursalesIds(auth.negocio.id);
    if (sucursalIds.length === 0) {
      return apiSuccess({ profesionales: [] });
    }

    const { searchParams } = new URL(request.url);
    const filterSucursalId = searchParams.get("sucursalId");
    const filterActivo = searchParams.get("activo");

    const result = await listarProfesionales({
      sucursalIds,
      filterSucursalId,
      filterActivo,
    });

    if (!result.ok) return result.error;

    return apiSuccess({ profesionales: result.data });
  } catch (error: unknown) {
    return apiError(error, "Error interno al consultar profesionales.", {
      extra: { route: "GET /api/negocio/profesionales" },
    });
  }
}

/**
 * POST /api/negocio/profesionales
 * Da de alta un nuevo colaborador en una sucursal del negocio autenticado.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedNegocio();
    if (!auth.ok) return auth.error;

    const sucursalIds = await getNegocioSucursalesIds(auth.negocio.id);
    const body = await request.json().catch(() => null);

    const validation = validateCreatePayload(body, sucursalIds);
    if (!validation.ok) return validation.error;

    const result = await crearProfesional({
      negocioId: auth.negocio.id,
      sucursalIds,
      data: validation.data,
    });

    if (!result.ok) return result.error;

    return apiSuccess({ profesional: result.data }, 201);
  } catch (error: unknown) {
    return apiError(error, "Error interno al crear el profesional.", {
      extra: { route: "POST /api/negocio/profesionales" },
    });
  }
}

/**
 * PATCH /api/negocio/profesionales
 * Actualiza los datos, estado (activo/inactivo) y servicios asignados de un profesional.
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedNegocio();
    if (!auth.ok) return auth.error;

    const sucursalIds = await getNegocioSucursalesIds(auth.negocio.id);
    const body = await request.json().catch(() => null);

    const validation = validateUpdatePayload(body, sucursalIds);
    if (!validation.ok) return validation.error;

    const result = await actualizarProfesional({
      negocioId: auth.negocio.id,
      sucursalIds,
      id: validation.data.id,
      updates: validation.data.updates,
      serviciosIds: validation.data.incomingServiciosIds,
    });

    if (!result.ok) return result.error;

    return apiSuccess({ profesional: result.data });
  } catch (error: unknown) {
    return apiError(error, "Error interno al actualizar el profesional.", {
      extra: { route: "PATCH /api/negocio/profesionales" },
    });
  }
}
