import { NextRequest, NextResponse } from "next/server";
import { NegocioAccessError, requireNegocioAccess } from "@/lib/auth/negocio-access";
import { apiError, apiSuccess } from "@/lib/utils/api-error";
import { consultarConfiguracion, prepararActualizacionConfiguracion, actualizarConfiguracion } from "@/lib/backend/configuracion/configuracion";

export async function GET() {
  try {
    const access = await requireNegocioAccess("config:read");
    const result = await consultarConfiguracion(access);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result);
  } catch (error: unknown) {
    if (error instanceof NegocioAccessError) {
      return apiError(error.message, undefined, { status: error.status, code: error.code });
    }
    return apiError(error, "Error interno al consultar configuración.", {
      extra: { route: "GET /api/negocio/configuracion" },
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const access = await requireNegocioAccess("config:write");

    const context = await prepararActualizacionConfiguracion(access);
    if (context instanceof NextResponse) return context;
    const body: unknown = await request.json().catch(() => null);
    const result = await actualizarConfiguracion(context, body);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result);
  } catch (error: unknown) {
    if (error instanceof NegocioAccessError) {
      return apiError(error.message, undefined, { status: error.status, code: error.code });
    }
    return apiError(error, "Error al actualizar configuración.", {
      extra: { route: "PUT /api/negocio/configuracion" },
    });
  }
}
