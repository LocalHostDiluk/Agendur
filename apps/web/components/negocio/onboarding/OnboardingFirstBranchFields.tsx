import {
  onboardingFieldClass,
  onboardingLabelClass,
} from "./OnboardingIdentityBusinessFields";

export interface OnboardingFirstBranchProps {
  nombreSucursal: string;
  telefonoSucursal: string;
  direccion: string;
  ciudad: string;
  estadoProvincia: string;
  codigoPostal: string;
  setNombreSucursal: (val: string) => void;
  setTelefonoSucursal: (val: string) => void;
  setDireccion: (val: string) => void;
  setCiudad: (val: string) => void;
  setEstadoProvincia: (val: string) => void;
  setCodigoPostal: (val: string) => void;
}

export function OnboardingFirstBranchFields({
  nombreSucursal,
  telefonoSucursal,
  direccion,
  ciudad,
  estadoProvincia,
  codigoPostal,
  setNombreSucursal,
  setTelefonoSucursal,
  setDireccion,
  setCiudad,
  setEstadoProvincia,
  setCodigoPostal,
}: OnboardingFirstBranchProps) {
  return (
    <section
      className="bg-surface border border-border rounded-[var(--radius-md)] p-6 shadow-2xs grid gap-4 sm:grid-cols-2"
      aria-labelledby="branch-title"
    >
      <h2 id="branch-title" className="font-semibold text-base text-text-primary sm:col-span-2">
        Primera sucursal
      </h2>
      <label className={onboardingLabelClass}>
        <span>Nombre de la sucursal</span>
        <input
          name="nombre_sucursal"
          className={onboardingFieldClass}
          value={nombreSucursal}
          onChange={(e) => setNombreSucursal(e.target.value)}
          maxLength={120}
          required
        />
      </label>
      <label className={onboardingLabelClass}>
        <span>Teléfono de la sucursal (+ código de país)</span>
        <input
          name="telefono_sucursal"
          type="tel"
          className={`${onboardingFieldClass} font-mono tabular-nums`}
          value={telefonoSucursal}
          onChange={(e) => setTelefonoSucursal(e.target.value)}
          placeholder="+528112345678"
          required
        />
      </label>
      <label className={onboardingLabelClass}>
        <span>Dirección</span>
        <input
          name="direccion"
          className={onboardingFieldClass}
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          maxLength={250}
          required
        />
      </label>
      <label className={onboardingLabelClass}>
        <span>Ciudad</span>
        <input
          name="ciudad"
          className={onboardingFieldClass}
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          maxLength={120}
          required
        />
      </label>
      <label className={onboardingLabelClass}>
        <span>Estado o provincia</span>
        <input
          name="estado_provincia"
          className={onboardingFieldClass}
          value={estadoProvincia}
          onChange={(e) => setEstadoProvincia(e.target.value)}
          maxLength={120}
          required
        />
      </label>
      <label className={onboardingLabelClass}>
        <span>Código postal</span>
        <input
          name="codigo_postal"
          className={`${onboardingFieldClass} font-mono tabular-nums`}
          value={codigoPostal}
          onChange={(e) => setCodigoPostal(e.target.value)}
          maxLength={10}
          required
        />
      </label>
    </section>
  );
}
