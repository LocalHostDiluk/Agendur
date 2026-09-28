import { NextResponse } from "next/server";
import type { Profesional } from "@/lib/types";

export interface ProfesionalConServicios extends Profesional {
  serviciosIds: string[];
}

export type AuthNegocioResult =
  | { ok: false; error: NextResponse }
  | {
      ok: true;
      user: { id: string; email?: string };
      negocio: { id: string };
    };

export interface ValidatedCreateProfesional {
  nombre: string;
  apellido: string;
  sucursal_id: string;
  cargo: string;
  email: string | null;
  telefono: string | null;
  avatar_url: string | null;
  activo: boolean;
  serviciosIds: string[];
}

export interface ValidatedUpdateProfesional {
  id: string;
  updates: Record<string, unknown>;
  incomingServiciosIds?: string[];
}

export interface ListarProfesionalesParams {
  sucursalIds: string[];
  filterSucursalId?: string | null;
  filterActivo?: string | null;
}

export interface CrearProfesionalParams {
  negocioId: string;
  sucursalIds: string[];
  data: ValidatedCreateProfesional;
}

export interface ActualizarProfesionalParams {
  negocioId: string;
  sucursalIds: string[];
  id: string;
  updates: Record<string, unknown>;
  serviciosIds?: string[];
}

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: NextResponse };
