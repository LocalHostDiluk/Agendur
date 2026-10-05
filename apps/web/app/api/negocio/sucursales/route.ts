import { NextRequest, NextResponse } from "next/server";
import { NegocioAccessError, requireNegocioAccess } from "@/lib/auth/negocio-access";
import { apiError, apiSuccess } from "@/lib/utils/api-error";
import { consultarSucursales, crearSucursalDesdeDatos, eliminarSucursal } from "@/lib/backend/sucursales/servicio";

export async function GET() {
  try {
    const access = await requireNegocioAccess("branches:read");
    const result = await consultarSucursales(access);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result);
  } catch (error: unknown) {
    if (error instanceof NegocioAccessError) {
      return apiError(error.message, undefined, { status: error.status, code: error.code });
    }
    return apiError(error, "Error interno al consultar sucursales.", {
      extra: { route: "GET /api/negocio/sucursales" },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireNegocioAccess("branches:write");

    const body: unknown = await request.json().catch(() => null);
    const result = await crearSucursalDesdeDatos(access, body);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result, 201);
  } catch (error: unknown) {
    if (error instanceof NegocioAccessError) {
      return apiError(error.message, undefined, { status: error.status, code: error.code });
    }
    return apiError(error, "Error al crear sucursal.", {
      extra: { route: "POST /api/negocio/sucursales" },
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const access = await requireNegocioAccess("branches:write");

    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    const result = await eliminarSucursal(access, id);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result);
  } catch (error: unknown) {
    if (error instanceof NegocioAccessError) {
      return apiError(error.message, undefined, { status: error.status, code: error.code });
    }
    return apiError(error, "Error al eliminar sucursal.", {
      extra: { route: "DELETE /api/negocio/sucursales" },
    });
  }
}
