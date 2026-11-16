import { CalendarClock, Percent } from "lucide-react";
import {
  ANTICIPACIONES_MAXIMAS,
  ANTICIPACIONES_MINIMAS,
} from "@/lib/utils/configuracion-constants";
import { ConfiguracionSwitchToggle } from "./ConfiguracionSwitchToggle";

export interface ConfiguracionTabHorariosProps {
  cobroAnticipo: boolean;
  setCobroAnticipo: (value: boolean) => void;
  porcentajeAnticipo: number;
  setPorcentajeAnticipo: (value: number) => void;
  anticipacionMinima: string;
  setAnticipacionMinima: (value: string) => void;
  anticipacionMaxima: string;
  setAnticipacionMaxima: (value: string) => void;
}

export function ConfiguracionTabHorarios({
  cobroAnticipo,
  setCobroAnticipo,
  porcentajeAnticipo,
  setPorcentajeAnticipo,
  anticipacionMinima,
  setAnticipacionMinima,
  anticipacionMaxima,
  setAnticipacionMaxima,
}: ConfiguracionTabHorariosProps) {
  return (
    <>
      {/* Advance Deposit Section */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="font-bricolage font-bold text-lg text-text-primary flex items-center gap-2">
            <Percent className="w-5 h-5 text-grape" />
            <span>Cobro de Anticipo / Depósito</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Reduce el ausentismo exigiendo un porcentaje de pago previo al
            confirmar la cita.
          </p>
        </div>

        <ConfiguracionSwitchToggle
          id="cobroAnticipo"
          checked={cobroAnticipo}
          onChange={setCobroAnticipo}
          label="Exigir anticipo obligatorio en el portal público"
          description="Al activarlo, el cliente deberá pagar el anticipo en línea mediante pasarela bancaria para asegurar el turno."
        />

        {cobroAnticipo && (
          <div className="p-4 bg-surface-alt border border-border rounded-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="porcentajeAnticipo"
                className="text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                Porcentaje de anticipo sobre el total
              </label>
              <span className="font-mono font-bold text-lg text-grape">
                {porcentajeAnticipo}%
              </span>
            </div>

            <input
              id="porcentajeAnticipo"
              type="range"
              min={5}
              max={100}
              step={5}
              value={porcentajeAnticipo}
              onChange={(e) => setPorcentajeAnticipo(Number(e.target.value))}
              className="w-full accent-grape cursor-pointer"
            />

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-xs text-text-secondary">
                Preajustes rápidos:
              </span>
              {[10, 20, 30, 50, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setPorcentajeAnticipo(pct)}
                  className={`px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-mono font-semibold transition-colors ${
                    porcentajeAnticipo === pct
                      ? "bg-grape text-white"
                      : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-border/40"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Windows (Anticipación mínima / máxima §10) */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="font-bricolage font-bold text-lg text-text-primary flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-grape" />
            <span>Ventana de Anticipación para Reservas</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Controla con cuánta antelación y hasta qué fecha futura pueden agendar tus clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="anticipacionMinima" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Anticipación Mínima
            </label>
            <select
              id="anticipacionMinima"
              value={anticipacionMinima}
              onChange={(e) => setAnticipacionMinima(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
            >
              {ANTICIPACIONES_MINIMAS.map((item) => (<option key={item.value} value={item.value}>{item.label}</option>))}
            </select>
            <p className="text-[11px] text-text-muted">
              Evita que entren citas sorpresa sin tiempo de preparación.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="anticipacionMaxima" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Anticipación Máxima
            </label>
            <select
              id="anticipacionMaxima"
              value={anticipacionMaxima}
              onChange={(e) => setAnticipacionMaxima(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
            >
              {ANTICIPACIONES_MAXIMAS.map((item) => (<option key={item.value} value={item.value}>{item.label}</option>))}
            </select>
            <p className="text-[11px] text-text-muted">
              Limita el horizonte del calendario para mayor predictibilidad.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
