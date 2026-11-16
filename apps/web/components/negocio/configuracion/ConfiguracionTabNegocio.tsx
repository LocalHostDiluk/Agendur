import { Clock, Coins, Image as ImageIcon } from "lucide-react";
import { ImageUploadButton } from "@/components/negocio/ImageUploadButton";
import { notify } from "@/lib/utils/toast";
import { GIROS_FRECUENTES, MONEDAS, PAISES, ZONAS_HORARIAS } from "@/lib/utils/configuracion-constants";

export interface ConfiguracionTabNegocioProps {
  negocioId?: string;
  logoUrl: string;
  setLogoUrl: (value: string) => void;
  nombreNegocio: string;
  setNombreNegocio: (value: string) => void;
  giroComercial: string;
  setGiroComercial: (value: string) => void;
  monedaPrincipal: string;
  setMonedaPrincipal: (value: string) => void;
  pais: string;
  setPais: (value: string) => void;
  zonaHoraria: string;
  setZonaHoraria: (value: string) => void;
}

export function ConfiguracionTabNegocio({
  negocioId, logoUrl, setLogoUrl, nombreNegocio, setNombreNegocio,
  giroComercial, setGiroComercial, monedaPrincipal, setMonedaPrincipal,
  pais, setPais, zonaHoraria, setZonaHoraria,
}: ConfiguracionTabNegocioProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="border-b border-border pb-3">
        <h2 className="font-bricolage font-bold text-lg text-text-primary">Información Comercial</h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Datos principales y logotipo que tus clientes verán al ingresar al portal de reservas.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-surface-alt border border-border">
        <div className="size-16 rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo de negocio"
              className="w-full h-full object-cover"
              onError={() => notify.error("No se pudo cargar la vista previa del logotipo.")}
            />
          ) : (
            <ImageIcon className="w-7 h-7 text-text-muted" />
          )}
        </div>
        <div className="flex-1 space-y-1.5 w-full">
          <label htmlFor="logoUrl" className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <span>URL del Logotipo Comercial</span>
          </label>
          <input
            id="logoUrl"
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://tudominio.com/logo.png"
            maxLength={500}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
          />
          {negocioId && (
            <ImageUploadButton bucket="logos-negocios" path={`${negocioId}/logo`} label="Subir logotipo" onUploaded={setLogoUrl} />
          )}
          <p className="text-[11px] text-text-muted">
            Sube una imagen PNG, JPG o WebP de hasta 5 MB, o proporciona un enlace directo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="nombreNegocio" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Nombre del Negocio *
          </label>
          <input
            id="nombreNegocio"
            type="text"
            required
            value={nombreNegocio}
            onChange={(e) => setNombreNegocio(e.target.value)}
            placeholder="Ej. Barbería Clásica & Spa"
            maxLength={200}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="giroComercial" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Giro o Categoría *
          </label>
          <input
            id="giroComercial"
            type="text"
            list="giros-list"
            required
            value={giroComercial}
            onChange={(e) => setGiroComercial(e.target.value)}
            placeholder="Selecciona o escribe el giro comercial"
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
          />
          <datalist id="giros-list">{GIROS_FRECUENTES.map((g) => (<option key={g} value={g} />))}</datalist>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="monedaPrincipal" className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-grape" />
            <span>Moneda Comercial</span>
          </label>
          <select
            id="monedaPrincipal"
            value={monedaPrincipal}
            onChange={(e) => setMonedaPrincipal(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm font-mono text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
          >
            {MONEDAS.map((m) => (<option key={m.code} value={m.code}>{m.label}</option>))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="pais" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">País</label>
          <select
            id="pais"
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
          >
            {PAISES.map((p) => (<option key={p.code} value={p.code}>{p.name} ({p.code})</option>))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="zonaHoraria" className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-grape" />
            <span>Zona Horaria Oficial</span>
          </label>
          <select
            id="zonaHoraria"
            value={zonaHoraria}
            onChange={(e) => setZonaHoraria(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
          >
            {ZONAS_HORARIAS.map((z) => (<option key={z.value} value={z.value}>{z.label}</option>))}
          </select>
        </div>
      </div>
    </div>
  );
}
