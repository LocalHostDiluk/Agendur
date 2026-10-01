import { CalendarClock, Phone, ShieldAlert, FileText } from "lucide-react";
import { SwitchToggle } from "@/components/ui";
import { ANTICIPACIONES_MINIMAS, ANTICIPACIONES_MAXIMAS } from "@/lib/constants/configuracion";
import { ConfiguracionAnticipoCard } from "./ConfiguracionAnticipoCard";

interface ConfiguracionPoliticasTabProps {
  cobroAnticipo: boolean; onCobroAnticipoChange: (checked: boolean) => void;
  porcentajeAnticipo: number; onPorcentajeAnticipoChange: (value: number) => void;
  anticipacionMinima: string; onAnticipacionMinimaChange: (value: string) => void;
  anticipacionMaxima: string; onAnticipacionMaximaChange: (value: string) => void;
  hasContactMethod: boolean;
  telefonoRequerido: boolean; onTelefonoRequeridoChange: (checked: boolean) => void;
  emailRequerido: boolean; onEmailRequeridoChange: (checked: boolean) => void;
  notasHabilitadas: boolean; onNotasHabilitadasChange: (checked: boolean) => void;
  politicaCancelacion: string; onPoliticaCancelacionChange: (value: string) => void;
}

export function ConfiguracionPoliticasTab({
  cobroAnticipo, onCobroAnticipoChange, porcentajeAnticipo, onPorcentajeAnticipoChange,
  anticipacionMinima, onAnticipacionMinimaChange, anticipacionMaxima, onAnticipacionMaximaChange,
  hasContactMethod, telefonoRequerido, onTelefonoRequeridoChange, emailRequerido,
  onEmailRequeridoChange, notasHabilitadas, onNotasHabilitadasChange,
  politicaCancelacion, onPoliticaCancelacionChange,
}: ConfiguracionPoliticasTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ConfiguracionAnticipoCard
        cobroAnticipo={cobroAnticipo} onCobroAnticipoChange={onCobroAnticipoChange}
        porcentajeAnticipo={porcentajeAnticipo} onPorcentajeAnticipoChange={onPorcentajeAnticipoChange}
      />

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
              id="anticipacionMinima" value={anticipacionMinima}
              onChange={(e) => onAnticipacionMinimaChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
            >
              {ANTICIPACIONES_MINIMAS.map((item) => (<option key={item.value} value={item.value}>{item.label}</option>))}
            </select>
            <p className="text-[11px] text-text-muted">Evita que entren citas sorpresa sin tiempo de preparación.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="anticipacionMaxima" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Anticipación Máxima
            </label>
            <select
              id="anticipacionMaxima" value={anticipacionMaxima}
              onChange={(e) => onAnticipacionMaximaChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
            >
              {ANTICIPACIONES_MAXIMAS.map((item) => (<option key={item.value} value={item.value}>{item.label}</option>))}
            </select>
            <p className="text-[11px] text-text-muted">Limita el horizonte del calendario para mayor predictibilidad.</p>
          </div>
        </div>
      </div>

      {/* Customer Contact Requirements */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="font-bricolage font-bold text-lg text-text-primary flex items-center gap-2">
            <Phone className="w-5 h-5 text-grape" />
            <span>Datos Requeridos al Cliente</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Define qué información es indispensable ingresar durante el proceso de reserva.
          </p>
        </div>

        {!hasContactMethod && (
          <div role="alert" className="p-3.5 rounded-xl bg-danger/10 border border-danger/25 flex items-center gap-3 text-xs text-danger">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span><strong>Atención:</strong> Se requiere al menos un medio de contacto (teléfono o correo electrónico) para poder notificar y confirmar reservas con tus clientes.</span>
          </div>
        )}

        <div className="divide-y divide-border">
          <SwitchToggle
            id="telefonoRequerido" checked={telefonoRequerido} onChange={onTelefonoRequeridoChange}
            label="Teléfono obligatorio"
            description="Requerido para enviar confirmaciones y recordatorios por WhatsApp y SMS."
          />
          <SwitchToggle
            id="emailRequerido" checked={emailRequerido} onChange={onEmailRequeridoChange}
            label="Correo electrónico obligatorio"
            description="Permite enviar recibos y enlaces directos para cancelar o reagendar."
          />
          <SwitchToggle
            id="notasHabilitadas" checked={notasHabilitadas} onChange={onNotasHabilitadasChange}
            label="Permitir notas y comentarios del cliente"
            description="Habilita un campo opcional para que los clientes agreguen especificaciones previas a su turno."
          />
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-bricolage font-bold text-lg text-text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-grape" />
              <span>Política de Cancelación y Reembolsos</span>
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Condiciones visibles para el cliente antes de confirmar su cita.
            </p>
          </div>
          <span className="font-mono text-xs text-text-secondary">{politicaCancelacion.length} / 2000</span>
        </div>

        <div className="space-y-1.5">
          <textarea
            rows={4} maxLength={2000} value={politicaCancelacion}
            onChange={(e) => onPoliticaCancelacionChange(e.target.value)}
            placeholder="Ejemplo: Las cancelaciones deben realizarse con al menos 24 horas de anticipación para solicitar reembolso de anticipo. Con menos de 24 horas, el depósito no será reembolsable..."
            className="w-full p-3.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-grape"
          />
          <p className="text-[11px] text-text-muted">
            Este texto se desplegará en el paso de confirmación y en los correos electrónicos de reserva.
          </p>
        </div>
      </div>
    </div>
  );
}
