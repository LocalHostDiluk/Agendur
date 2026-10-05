import { NextRequest, NextResponse } from "next/server";
import { NegocioAccessError, requireNegocioAccess, type NegocioCapability, type NegocioAccess } from "@/lib/auth/negocio-access";
import { apiError, apiSuccess } from "@/lib/utils/api-error";
import { consultarServicios, crearServicio, actualizarServicio, eliminarServicio } from "@/lib/backend/servicios/catalogo";

async function getAuthenticatedNegocio(
  capability: NegocioCapability,
): Promise<NegocioAccess> {
  return requireNegocioAccess(capability);
}

function accessFailure(error: unknown): NextResponse | null {
  if (!(error instanceof NegocioAccessError)) return null;
  return apiError(error.message, undefined, { status: error.status, code: error.code });
}

export async function GET(): Promise<NextResponse> {
  try {
    const access = await getAuthenticatedNegocio("services:read");
    const result = await consultarServicios(access);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result);
  } catch (error: unknown) {
    const denied = accessFailure(error);
    if (denied) return denied;
    return apiError(error, "Error interno al consultar servicios.", {
      extra: { route: "GET /api/negocio/servicios" },
    });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const access = await getAuthenticatedNegocio("services:write");

    const body: unknown = await request.json().catch(() => null);
    const result = await crearServicio(access, body);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result, 201);
  } catch (error: unknown) {
    const denied = accessFailure(error);
    if (denied) return denied;
    return apiError(error, "Error interno al crear el servicio.", {
      extra: { route: "POST /api/negocio/servicios" },
    });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const access = await getAuthenticatedNegocio("services:write");

    const body: unknown = await request.json().catch(() => null);
    const result = await actualizarServicio(access, body);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result);
  } catch (error: unknown) {
    const denied = accessFailure(error);
    if (denied) return denied;
    return apiError(error, "Error interno al actualizar el servicio.", {
      extra: { route: "PATCH /api/negocio/servicios" },
    });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const access = await getAuthenticatedNegocio("services:write");

    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    const result = await eliminarServicio(access, id);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result);
  } catch (error: unknown) {
    const denied = accessFailure(error);
    if (denied) return denied;
    return apiError(error, "Error interno al eliminar el servicio.", {
      extra: { route: "DELETE /api/negocio/servicios" },
    });
  }
}
