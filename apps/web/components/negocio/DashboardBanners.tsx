import type { Suscripcion } from "@/lib/types";
import { DashboardOnboardingBanner } from "./DashboardOnboardingBanner";
import { DashboardRecoveryBanner } from "./DashboardRecoveryBanner";
import { DashboardSubscriptionCard } from "./DashboardSubscriptionCard";
import { DashboardWelcomeCard } from "./DashboardWelcomeCard";

interface DashboardBannersProps {
  isSyncError: boolean;
  isOnboardingRequired: boolean;
  sucursalesCount: number;
  nombreNegocioRescatado?: string | null;
  nombreUsuario: string;
  nombreNegocio?: string;
  negocioSlug?: string;
  copyBookingUrl: () => void;
  copied: boolean;
  suscripcion?: Pick<Suscripcion, "estado" | "intervalo"> | null;
  planNombre: string;
  sucursalesUsadas: number;
  sucursalesLimite: number;
  handleRetryAll: () => Promise<void>;
  isRetrying: boolean;
}

export function DashboardBanners({
  isSyncError,
  isOnboardingRequired,
  sucursalesCount,
  nombreNegocioRescatado,
  nombreUsuario,
  nombreNegocio,
  negocioSlug,
  copyBookingUrl,
  copied,
  suscripcion,
  planNombre,
  sucursalesUsadas,
  sucursalesLimite,
  handleRetryAll,
  isRetrying,
}: DashboardBannersProps) {
  return (
    <>
      {isSyncError ? (
        <DashboardRecoveryBanner
          sucursalesCount={sucursalesCount}
          nombreNegocioRescatado={nombreNegocioRescatado}
          handleRetryAll={handleRetryAll}
          isRetrying={isRetrying}
        />
      ) : isOnboardingRequired ? (
        /* ONBOARDING BANNER: Motivo Ticket + Sello Circular de Progreso (Design System §5.6 #1) */
        <DashboardOnboardingBanner nombreUsuario={nombreUsuario} />
      ) : (
        /* WELCOME BANNER ACTIVO + TARJETA DE PLAN Y UPGRADE CON MUESCA DE TICKET (§5.6.4) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <DashboardWelcomeCard
            sucursalesCount={sucursalesCount}
            nombreNegocio={nombreNegocio}
            negocioSlug={negocioSlug}
            copyBookingUrl={copyBookingUrl}
            copied={copied}
          />
          <DashboardSubscriptionCard
            suscripcion={suscripcion}
            planNombre={planNombre}
            sucursalesUsadas={sucursalesUsadas}
            sucursalesLimite={sucursalesLimite}
          />
        </div>
      )}
    </>
  );
}
