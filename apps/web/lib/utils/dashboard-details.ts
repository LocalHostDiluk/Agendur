import type { AuthMeResponse } from "@/lib/hooks/use-auth-me";
import type { Cita, Sucursal, Suscripcion } from "@/lib/types";

interface DashboardBannerDetailsOptions {
  auth: AuthMeResponse | undefined;
  suscripcion: Suscripcion | null | undefined;
  sucursalesList: Sucursal[];
  configNombre?: string;
  sucursalesUsadas?: number;
  sucursalesLimite?: number;
}

export function getDashboardBannerDetails({
  auth, suscripcion, sucursalesList, configNombre, sucursalesUsadas, sucursalesLimite,
}: DashboardBannerDetailsOptions) {
  const negocio = auth?.negocio;
  return {
    nombreNegocioRescatado: negocio?.nombre_comercial ?? configNombre ??
      (sucursalesList[0]?.nombre ? sucursalesList[0].nombre : null),
    nombreUsuario: auth?.perfil?.nombres ?? auth?.user?.email ?? "bienvenido",
    nombreNegocio: negocio?.nombre_comercial,
    suscripcion,
    planNombre: suscripcion?.plan_nombre ?? "Estándar",
    sucursalesCount: sucursalesList.length,
    sucursalesUsadas: sucursalesUsadas ?? auth?.sucursalesCount ??
      (sucursalesList.length > 0 ? sucursalesList.length : 0),
    sucursalesLimite: sucursalesLimite ?? suscripcion?.limite_sucursales ??
      (sucursalesList.length > 0 ? Math.max(sucursalesList.length, 2) : 2),
  };
}

export function getDashboardCurrentAppointments(citas: Cita[], hoy: string | null) {
  const citasHoy = hoy ? citas.filter((cita) => cita.fecha === hoy) : [];
  const citasPendientes = citasHoy.filter((cita) => cita.estado === "pendiente_pago");
  const ingresosConfirmados = citas
    .filter((cita) => cita.estado === "confirmada" || cita.estado === "completada")
    .reduce((total, cita) => total + (cita.precio_total ?? 0), 0);
  return { citasHoy, citasPendientes, ingresosConfirmados };
}
