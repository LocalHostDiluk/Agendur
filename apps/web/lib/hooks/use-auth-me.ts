import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/api-client";
import type { Negocio, Suscripcion } from "@/lib/types";

export interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    createdAt: string;
  } | null;
  negocio: Negocio | null;
  suscripcion: Suscripcion | null;
  perfil?: { nombres: string; apellidos: string; telefono: string | null; locale: string } | null;
  sucursalesCount?: number;
  onboardingStatus?: "required" | "complete";
}

export function useAuthMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiFetch<AuthMeResponse>("/api/auth/me"),
    staleTime: 5 * 60 * 1000,
  });
}
