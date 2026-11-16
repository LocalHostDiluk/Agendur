import { PendingBadge } from "@/components/ui/PendingBadge";

export const onboardingFieldClass =
  "w-full bg-surface-alt/50 border border-border focus:border-grape focus:ring-1 focus:ring-grape rounded-[var(--radius-md)] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors outline-hidden";
export const onboardingLabelClass = "space-y-1.5 text-xs font-medium text-text-secondary";

export interface OnboardingIdentityBusinessProps {
  nombresValue: string;
  apellidosValue: string;
  telefonoPerfilValue: string;
  nombreNegocioValue: string;
  giroComercialValue: string;
  paisValue: string;
  zonaHoraria: string;
  setNombres: (val: string) => void;
  setApellidos: (val: string) => void;
  setTelefonoPerfil: (val: string) => void;
  setNombreNegocio: (val: string) => void;
  setGiroComercial: (val: string) => void;
  setPais: (val: string) => void;
  setZonaHoraria: (val: string) => void;
}

export function OnboardingIdentityBusinessFields({
  nombresValue,
  apellidosValue,
  telefonoPerfilValue,
  nombreNegocioValue,
  giroComercialValue,
  paisValue,
  zonaHoraria,
  setNombres,
  setApellidos,
  setTelefonoPerfil,
  setNombreNegocio,
  setGiroComercial,
  setPais,
  setZonaHoraria,
}: OnboardingIdentityBusinessProps) {
  return (
    <>
      <section
        className="bg-surface border border-border rounded-[var(--radius-md)] p-6 shadow-2xs grid gap-4 sm:grid-cols-2"
        aria-labelledby="identity-title"
      >
        <h2 id="identity-title" className="font-semibold text-base text-text-primary sm:col-span-2">
          Tu identidad
        </h2>
        <label className={onboardingLabelClass}>
          <span>Nombres</span>
          <input name="nombres" className={onboardingFieldClass} value={nombresValue} onChange={(e) => setNombres(e.target.value)} maxLength={120} required />
        </label>
        <label className={onboardingLabelClass}>
          <span>Apellidos</span>
          <input name="apellidos" className={onboardingFieldClass} value={apellidosValue} onChange={(e) => setApellidos(e.target.value)} maxLength={120} required />
        </label>
        <label className={onboardingLabelClass}>
          <span className="inline-flex items-center">
            Teléfono personal (opcional)
            <PendingBadge label="Opcional" tooltip="Dato opcional para contacto del administrador" className="ml-2" />
          </span>
          <input
            name="telefono_perfil"
            type="tel"
            className={`${onboardingFieldClass} font-mono tabular-nums`}
            value={telefonoPerfilValue}
            onChange={(e) => setTelefonoPerfil(e.target.value)}
            placeholder="+528112345678"
          />
        </label>
      </section>

      <section
        className="bg-surface border border-border rounded-[var(--radius-md)] p-6 shadow-2xs grid gap-4 sm:grid-cols-2"
        aria-labelledby="business-title"
      >
        <h2 id="business-title" className="font-semibold text-base text-text-primary sm:col-span-2">
          Negocio
        </h2>
        <label className={onboardingLabelClass}>
          <span>Nombre comercial</span>
          <input name="nombre_negocio" className={onboardingFieldClass} value={nombreNegocioValue} onChange={(e) => setNombreNegocio(e.target.value)} maxLength={200} required />
        </label>
        <label className={onboardingLabelClass}>
          <span>Giro comercial</span>
          <input name="giro_comercial" className={onboardingFieldClass} value={giroComercialValue} onChange={(e) => setGiroComercial(e.target.value)} maxLength={200} required />
        </label>
        <label className={onboardingLabelClass}>
          <span>País (código ISO de dos letras)</span>
          <input
            name="pais"
            className={`${onboardingFieldClass} font-mono uppercase`}
            value={paisValue}
            onChange={(e) => setPais(e.target.value.toUpperCase())}
            maxLength={2}
            pattern="[A-Z]{2}"
            required
          />
        </label>
        <label className={onboardingLabelClass}>
          <span>Zona horaria IANA</span>
          <input
            name="zona_horaria"
            className={onboardingFieldClass}
            value={zonaHoraria}
            onChange={(e) => setZonaHoraria(e.target.value)}
            placeholder="America/Monterrey"
            list="zonas-horarias"
            required
          />
        </label>
        <datalist id="zonas-horarias">
          <option value="America/Monterrey" />
          <option value="America/Mexico_City" />
          <option value="America/Cancun" />
          <option value="America/Tijuana" />
        </datalist>
        <p className="text-xs text-text-muted sm:col-span-2">
          Selecciona la zona donde opera tu negocio; no uses la zona de tu dispositivo si es distinta.
        </p>
      </section>
    </>
  );
}
