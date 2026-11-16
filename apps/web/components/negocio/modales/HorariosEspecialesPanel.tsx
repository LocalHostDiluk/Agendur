"use client";

import { CalendarOff, Pencil, Trash2 } from "lucide-react";
import type { Profesional, Sucursal } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import {
  useHorariosEspecialesState,
  type ResourceType,
} from "@/lib/hooks/use-horarios-especiales-state";
import { HorariosEspecialesForm } from "./HorariosEspecialesForm";

export function HorariosEspecialesPanel({
  sucursales,
  profesionales,
  canWrite,
}: {
  sucursales: Sucursal[];
  profesionales: Profesional[];
  canWrite: boolean;
}) {
  const state = useHorariosEspecialesState(sucursales, profesionales);

  return (
    <section
      className="border-t border-border p-4 sm:p-6 space-y-5"
      aria-labelledby="special-schedules-title"
    >
      <div>
        <h3
          id="special-schedules-title"
          className="font-bricolage font-bold text-base text-text-primary flex items-center gap-2"
        >
          <CalendarOff className="size-4 text-grape" /> Horarios especiales
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Define cierres completos o varios bloques para una fecha concreta.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs font-semibold text-text-secondary">
          Tipo
          <select
            value={state.tipo}
            onChange={(event) => {
              state.setTipo(event.target.value as ResourceType);
              state.setSelectedId("");
            }}
            className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary"
          >
            <option value="profesional">Profesional</option>
            <option value="sucursal">Sucursal</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-text-secondary">
          {state.tipo === "sucursal" ? "Sucursal" : "Profesional"}
          <select
            value={state.recursoId ?? ""}
            onChange={(event) => state.setSelectedId(event.target.value)}
            className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary"
          >
            {state.resources.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {canWrite && state.recursoId && (
        <HorariosEspecialesForm
          fecha={state.fecha}
          onChangeFecha={state.setFecha}
          motivo={state.motivo}
          onChangeMotivo={state.setMotivo}
          cerrado={state.cerrado}
          onChangeCerrado={state.setCerrado}
          bloques={state.bloques}
          onChangeBloques={state.setBloques}
          onSave={state.saveSchedule}
          isSaving={state.save.isPending}
        />
      )}

      <div className="space-y-2">
        {state.schedules.isLoading && (
          <p className="text-sm text-text-muted">Cargando horarios…</p>
        )}
        {!state.schedules.isLoading && state.grouped.length === 0 && (
          <p className="text-sm text-text-muted">
            No hay horarios especiales registrados.
          </p>
        )}
        {state.grouped.map(([date, rows]) => (
          <div
            key={date}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border p-3"
          >
            <div>
              <p className="font-mono text-sm font-bold text-text-primary">
                {date}
              </p>
              <p className="text-xs text-text-secondary">
                {rows[0].cerrado
                  ? "Cierre completo"
                  : rows
                      .map((row) => `${row.inicio?.slice(0, 5)}–${row.fin?.slice(0, 5)}`)
                      .join(", ")}
                {rows[0].motivo ? ` · ${rows[0].motivo}` : ""}
              </p>
            </div>
            {canWrite && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => state.editSchedule(date, rows)}
                >
                  <Pencil className="size-4" /> Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => state.deleteSchedule(date)}
                  disabled={state.remove.isPending}
                >
                  <Trash2 className="size-4" /> Eliminar
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
