import { NextRequest, NextResponse } from "next/server";
import { NegocioAccessError, requireNegocioAccess, type NegocioCapability } from "@/lib/auth/negocio-access";
import { apiError, apiSuccess } from "@/lib/utils/api-error";
import { consultarProfesionales } from "@/lib/backend/profesionales/consultar-profesionales";
import { crearProfesional } from "@/lib/backend/profesionales/crear-profesional";
import { actualizarProfesional } from "@/lib/backend/profesionales/actualizar-profesional";
import { eliminarProfesional } from "@/lib/backend/profesionales/eliminar-profesional";

async function getAuthenticatedNegocio(capability: NegocioCapability) {
  try {
    const access = await requireNegocioAccess(capability);
    return { ok: true as const, user: access.user, negocio: { id: access.negocioId }, access };
  } catch (error) {
    if (error instanceof NegocioAccessError) return { ok: false as const, error: apiError(error.message, undefined, { status: error.status, code: error.code }) };
    throw error;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedNegocio("appointments:read");

    if (!auth.ok) return auth.error;

    const { searchParams } = new URL(request.url);
    const result = await consultarProfesionales(auth.access, searchParams.get("sucursalId"), searchParams.get("activo"));
    if (result instanceof NextResponse) return result;
    return apiSuccess(result);
  } catch (error: unknown) {
    return apiError(error, "Error interno al consultar profesionales.", {
      extra: { route: "GET /api/negocio/profesionales" },
    });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedNegocio("branches:write");

    if (!auth.ok) return auth.error;

    const body: unknown = await request.json().catch(() => null);
    const result = await crearProfesional(auth.access, body);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result, 201);
  } catch (error: unknown) {
    return apiError(error, "Error interno al crear el profesional.", {
      extra: { route: "POST /api/negocio/profesionales" },
    });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedNegocio("branches:write");

    if (!auth.ok) return auth.error;

    const body: unknown = await request.json().catch(() => null);
    const result = await actualizarProfesional(auth.access, body);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result);
  } catch (error: unknown) {
    return apiError(error, "Error interno al actualizar el profesional.", {
      extra: { route: "PATCH /api/negocio/profesionales" },
    });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getAuthenticatedNegocio("branches:write");

    if (!auth.ok) return auth.error;

    const { searchParams } = new URL(request.url);

    let id = searchParams.get("id");

    if (!id) {
      const body = await request.json().catch(() => null);
      if (body && typeof body === "object" && "id" in body) {
        id = String((body as Record<string, unknown>).id);
      }
    }
    const result = await eliminarProfesional(auth.access, id);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result);
  } catch (error: unknown) {
    return apiError(error, "Error interno al eliminar el profesional.", {
      extra: { route: "DELETE /api/negocio/profesionales" },
    });
  }
}
