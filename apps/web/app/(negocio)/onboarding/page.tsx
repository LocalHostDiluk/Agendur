"use client";

import { Button } from "@/components/ui/Button";
import { useOnboardingForm } from "@/lib/hooks/use-onboarding-form";
import {
  OnboardingTicketBanner,
  OnboardingCompleteCard,
  OnboardingIdentityBusinessFields,
  OnboardingFirstBranchFields,
} from "@/components/negocio/onboarding";

export default function OnboardingPage() {
  const { auth, sucursales, saving, formError, save, isLoading, hasError, values, setters } =
    useOnboardingForm();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p role="status" className="text-sm text-text-secondary">Cargando tus datos…</p>
      </div>
    );
  }
  if (auth && !auth.negocio) {
    return (
      <div className="mx-auto max-w-xl p-6 bg-surface border border-danger/30 rounded-[var(--radius-md)]">
        <p role="alert" className="text-sm text-danger">Esta cuenta no tiene un negocio asociado. Contacta a soporte antes de crear una sucursal.</p>
      </div>
    );
  }
  if (hasError) {
    return (
      <div className="mx-auto max-w-xl p-6 bg-surface border border-danger/30 rounded-[var(--radius-md)]">
        <p role="alert" className="text-sm text-danger">No pudimos cargar los datos de tu negocio. Recarga la página o vuelve a iniciar sesión.</p>
      </div>
    );
  }
  if ((sucursales?.sucursales.length ?? 0) > 0) {
    return <OnboardingCompleteCard />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <OnboardingTicketBanner />

      <form onSubmit={save} className="space-y-6">
        <OnboardingIdentityBusinessFields {...values} {...setters} />
        <OnboardingFirstBranchFields {...values} {...setters} />

        {formError && (
          <p role="alert" className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-[var(--radius-md)] p-3">
            {formError}
          </p>
        )}

        <div>
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
            disabled={saving || !sucursales}
          >
            Guardar y abrir panel
          </Button>
        </div>
      </form>
    </div>
  );
}
