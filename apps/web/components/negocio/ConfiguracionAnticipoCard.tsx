import { Percent } from "lucide-react";
import { SwitchToggle } from "@/components/ui";

interface ConfiguracionAnticipoCardProps {
  cobroAnticipo: boolean;
  onCobroAnticipoChange: (checked: boolean) => void;
  porcentajeAnticipo: number;
  onPorcentajeAnticipoChange: (value: number) => void;
}

const PRESET_PORCENTAJES = [10, 20, 30, 50, 100];

export function ConfiguracionAnticipoCard({
  cobroAnticipo, onCobroAnticipoChange, porcentajeAnticipo, onPorcentajeAnticipoChange,
}: ConfiguracionAnticipoCardProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="border-b border-border pb-3">
        <h2 className="font-bricolage font-bold text-lg text-text-primary flex items-center gap-2">
          <Percent className="w-5 h-5 text-grape" />
          <span>Cobro de Anticipo / Depósito</span>
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Reduce el ausentismo exigiendo un porcentaje de pago previo al confirmar la cita.
        </p>
      </div>

      <SwitchToggle
        id="cobroAnticipo" checked={cobroAnticipo} onChange={onCobroAnticipoChange}
        label="Exigir anticipo obligatorio en el portal público"
        description="Al activarlo, el cliente deberá pagar el anticipo en línea mediante pasarela bancaria para asegurar el turno."
      />

      {cobroAnticipo && (
        <div className="p-4 bg-surface-alt border border-border rounded-xl space-y-3.5">
          <div className="flex items-center justify-between">
            <label htmlFor="porcentajeAnticipo" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Porcentaje de anticipo sobre el total
            </label>
            <span className="font-mono font-bold text-lg text-grape">{porcentajeAnticipo}%</span>
          </div>

          <input
            id="porcentajeAnticipo" type="range" min={5} max={100} step={5}
            value={porcentajeAnticipo} onChange={(e) => onPorcentajeAnticipoChange(Number(e.target.value))}
            className="w-full accent-grape cursor-pointer"
          />

          {/* Quick Percentage Chips */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-xs text-text-secondary">Preajustes rápidos:</span>
            {PRESET_PORCENTAJES.map((pct) => (
              <button
                key={pct} type="button" onClick={() => onPorcentajeAnticipoChange(pct)}
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
  );
}
