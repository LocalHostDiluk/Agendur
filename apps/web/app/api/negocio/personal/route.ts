import { NextRequest, NextResponse } from "next/server";
import { NegocioAccessError, requireNegocioAccess } from "@/lib/auth/negocio-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { SubscriptionExpiredError } from "@/lib/payments/guards";
import { apiError, apiSuccess } from "@/lib/utils/api-error";
import { consultarPersonal } from "@/lib/backend/personal/directorio";
import { agregarPersonal } from "@/lib/backend/personal/agregar-personal";
import { actualizarPersonal } from "@/lib/backend/personal/actualizar-personal";

function accessFailure(error: unknown): NextResponse | null {
  if (!(error instanceof NegocioAccessError)) return null;
  return apiError(error.message, undefined, {
    status: error.status,
    code: error.code,
  });
}

export async function GET(): Promise<NextResponse> {
  try {
    const access = await requireNegocioAccess("staff:read");
    const result = await consultarPersonal(access);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result);
  } catch (error) {
    const denied = accessFailure(error);
    if (denied) return denied;
    return apiError(error, "No se pudo consultar el personal.", {
      extra: { route: "GET /api/negocio/personal" },
    });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const access = await requireNegocioAccess("staff:write");

    const admin = createAdminClient();

    const body: unknown = await request.json().catch(() => null);
    const result = await agregarPersonal(access, admin, body);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result, 201);
  } catch (error) {
    const denied = accessFailure(error);
    if (denied) return denied;
    if (error instanceof SubscriptionExpiredError) return apiError(error.message, undefined, { status: 402, code: error.code });
    if (typeof (error as { message?: unknown })?.message === "string" &&
        (error as { message: string }).message.includes("BRANCH_SCHEDULE_REQUIRED")) {
      return apiError("La sucursal debe tener un horario semanal antes de agregar profesionales.", undefined, {
        status: 409,
        code: "BRANCH_SCHEDULE_REQUIRED",
      });
    }
    return apiError(error, "No se pudo crear el personal.", {
      extra: { route: "POST /api/negocio/personal" },
    });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const access = await requireNegocioAccess("staff:write");

    const admin = createAdminClient();

    const body: unknown = await request.json().catch(() => null);
    const result = await actualizarPersonal(access, admin, body);
    if (result instanceof NextResponse) return result;
    return apiSuccess(result);
  } catch (error) {
    const denied = accessFailure(error);
    if (denied) return denied;
    if (error instanceof SubscriptionExpiredError) return apiError(error.message, undefined, { status: 402, code: error.code });
    return apiError(error, "No se pudo actualizar el personal.", {
      extra: { route: "PATCH /api/negocio/personal" },
    });
  }
}
