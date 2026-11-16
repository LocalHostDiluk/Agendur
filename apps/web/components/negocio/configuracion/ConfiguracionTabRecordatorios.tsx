import { useMemo } from "react";
import { MessageSquare, Send, Smartphone } from "lucide-react";
import { PendingBadge } from "@/components/ui";
import { PLANTILLA_VARIABLES, renderTemplatePreview } from "@/lib/utils/configuracion-helpers";
import { ConfiguracionTicketPreview } from "./ConfiguracionTicketPreview";

export interface ConfiguracionTabRecordatoriosProps {
  canalPlantilla: "whatsapp" | "sms";
  setCanalPlantilla: (value: "whatsapp" | "sms") => void;
  tipoPlantilla: "recordatorio" | "confirmacion" | "cancelacion";
  setTipoPlantilla: (value: "recordatorio" | "confirmacion" | "cancelacion") => void;
  plantillaWhatsApp: string;
  setPlantillaWhatsApp: (value: string) => void;
  plantillaSMS: string;
  setPlantillaSMS: (value: string) => void;
  insertVariable: (varName: string) => void;
  sucursalNombre: string;
  nombreNegocio: string;
  slug?: string;
}

export function ConfiguracionTabRecordatorios({
  canalPlantilla, setCanalPlantilla, tipoPlantilla, setTipoPlantilla,
  plantillaWhatsApp, setPlantillaWhatsApp, plantillaSMS, setPlantillaSMS,
  insertVariable, sucursalNombre, nombreNegocio, slug,
}: ConfiguracionTabRecordatoriosProps) {
  const activeTemplateText = canalPlantilla === "whatsapp" ? plantillaWhatsApp : plantillaSMS;
  const previewRenderedText = useMemo(
    () => renderTemplatePreview(activeTemplateText, sucursalNombre, nombreNegocio, slug),
    [activeTemplateText, sucursalNombre, nombreNegocio, slug],
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-grape" />
              <h2 className="font-bricolage font-bold text-lg text-text-primary">Plantillas de Notificaciones</h2>
              <PendingBadge label="Beta" tooltip="Envío automatizado en fase de pruebas" />
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Personaliza los mensajes directos que tus clientes reciben por WhatsApp y SMS para reducir ausencias.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-surface-alt border border-border rounded-xl">
            <button
              type="button"
              onClick={() => setCanalPlantilla("whatsapp")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                canalPlantilla === "whatsapp" ? "bg-grape text-white shadow-xs" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => setCanalPlantilla("sms")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                canalPlantilla === "sms" ? "bg-grape text-white shadow-xs" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>SMS</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-text-secondary mr-1">Momento de envío:</span>
          {[
            { id: "recordatorio" as const, label: "Recordatorio 24h antes" },
            { id: "confirmacion" as const, label: "Confirmación inmediata" },
            { id: "cancelacion" as const, label: "Cancelación o Reagendamiento" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTipoPlantilla(item.id)}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all ${
                tipoPlantilla === item.id
                  ? "bg-grape text-white shadow-xs"
                  : "bg-surface-alt border border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="templateText" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Contenido del Mensaje
                </label>
                <span className="font-mono text-xs text-text-secondary">{activeTemplateText.length} caracteres</span>
              </div>
              <textarea
                id="templateText"
                rows={6}
                value={activeTemplateText}
                onChange={(e) => (canalPlantilla === "whatsapp" ? setPlantillaWhatsApp(e.target.value) : setPlantillaSMS(e.target.value))}
                className="w-full p-3.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape font-sans leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-text-secondary">Haz clic para insertar variables dinámicas:</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PLANTILLA_VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => insertVariable(v.key)}
                    className="px-2.5 py-1 rounded-[var(--radius-sm)] bg-surface-alt border border-border text-[11px] font-mono font-medium text-grape hover:bg-grape-soft transition-colors select-none"
                  >
                    {v.key}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ConfiguracionTicketPreview
            nombreNegocio={nombreNegocio}
            canalPlantilla={canalPlantilla}
            previewRenderedText={previewRenderedText}
          />
        </div>
      </div>
    </div>
  );
}
