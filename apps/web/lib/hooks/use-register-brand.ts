import { useEffect } from "react";
import { useAuthBrand } from "@/components/auth/AuthBrandContext";

export function useRegisterBrand(step: number): void {
  const { setCopy } = useAuthBrand();

  useEffect(() => {
    if (step === 1) {
      setCopy({
        headline: "Únete a +500 negocios que ya organizan su agenda.",
        subheadline:
          "Crea tu cuenta en menos de 2 minutos y empieza hoy mismo.",
      });
    } else if (step === 2) {
      setCopy({
        headline: "Cuéntanos quién va a estar del otro lado.",
        subheadline:
          "Personaliza tu perfil de administrador para tu equipo.",
      });
    } else if (step === 3) {
      setCopy({
        headline: "Personaliza tu negocio en menos de 2 minutos.",
        subheadline:
          "Configura tu giro y sucursales para comenzar a recibir citas.",
      });
    }
  }, [step, setCopy]);
}
