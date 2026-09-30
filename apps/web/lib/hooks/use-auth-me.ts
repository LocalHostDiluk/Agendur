import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/api-client";
import type { Negocio, PerfilUsuario, Suscripcion } from "@/lib/types";

export interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    createdAt: string;
  } | null;
  negocio: Negocio | null;
  suscripcion: Suscripcion | null;
  perfil?: PerfilUsuario | null;
  sucursalesCount?: number;
  sucursalesActivasCount?: number;
  onboardingStatus?: "required" | "complete";
  access?: { role: "owner" | "manager" | "receptionist" | "professional"; sucursalId: string | null; profesionalId: string | null; capabilities: string[] };
  availableBusinesses?: { id: string; nombre: string; role: string }[];
}

export function useAuthMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiFetch<AuthMeResponse>("/api/auth/me"),
    staleTime: 5 * 60 * 1000,
  });
}
