"use client";

import { useMemo, useState } from "react";
import { CalendarOff, Pencil, Plus, Save, Trash2 } from "lucide-react";
import {
  useDeleteSpecialSchedule,
  useSaveSpecialSchedule,
  useSpecialSchedules,
  type SpecialSchedule,
} from "@/lib/hooks";
import type { Profesional, Sucursal } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { notify } from "@/lib/utils/toast";

type ResourceType = "sucursal" | "profesional";
type Block = { inicio: string; fin: string };

export function HorariosEspecialesPanel({
  sucursales,
  profesionales,
  canWrite,
}: {
  sucursales: Sucursal[];
  profesionales: Profesional[];
  canWrite: boolean;
}) {
  const [tipo, setTipo] = useState<ResourceType>("profesional");
  const [selectedId, setSelectedId] = useState("");
  const [fecha, setFecha] = useState("");
  const [cerrado, setCerrado] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [bloques, setBloques] = useState<Block[]>([{ inicio: "09:00", fin: "17:00" }]);

  const resources = tipo === "sucursal"
    ? sucursales.map((item) => ({ id: item.id, label: item.nombre }))
    : profesionales.map((item) => ({ id: item.id, label: `${item.nombre} ${item.apellido ?? ""}`.trim() }));
  const recursoId = resources.some((item) => item.id === selectedId)
    ? selectedId
    : resources[0]?.id;
  const schedules = useSpecialSchedules(tipo, recursoId);
  const save = useSaveSpecialSchedule();
  const remove = useDeleteSpecialSchedule();

  const grouped = useMemo(() => {
    const result = new Map<string, SpecialSchedule[]>();
    for (const item of schedules.data?.excepciones ?? []) {
      const rows = result.get(item.fecha) ?? [];
      rows.push(item);
      result.set(item.fecha, rows);
    }
    return [...result.entries()];
  }, [schedules.data?.excepciones]);

  function editSchedule(date: string, rows: SpecialSchedule[]) {
    setFecha(date);
    setCerrado(rows[0]?.cerrado ?? false);
    setMotivo(rows[0]?.motivo ?? "");
    setBloques(rows[0]?.cerrado
      ? [{ inicio: "09:00", fin: "17:00" }]
      : rows.map((row) => ({ inicio: row.inicio?.slice(0, 5) ?? "09:00", fin: row.fin?.slice(0, 5) ?? "17:00" })));
  }

  async function saveSchedule() {
    if (!recursoId || !fecha) return notify.error("Faltan datos", "Selecciona un recurso y una fecha.");
    try {
      await save.mutateAsync({
        tipo,
        recursoId,
        fecha,
        cerrado,
        motivo,
        bloques: cerrado ? [] : bloques,
      });
      notify.success("Horario guardado", "La disponibilidad especial ya está activa.");
    } catch (error) {
      notify.error("No se pudo guardar", error instanceof Error ? error.message : "Revisa los bloques capturados.");
    }
  }

  async function deleteSchedule(date: string) {
    if (!recursoId) return;
    try {
      await remove.mutateAsync({ tipo, recursoId, fecha: date });
      if (fecha === date) setFecha("");
      notify.success("Horario eliminado", "Se volverá a usar el horario semanal.");
    } catch (error) {
      notify.error("No se pudo eliminar", error instanceof Error ? error.message : "Inténtalo nuevamente.");
    }
  }

  return (
    <section className="border-t border-border p-4 sm:p-6 space-y-5" aria-labelledby="special-schedules-title">
      <div>
        <h3 id="special-schedules-title" className="font-bricolage font-bold text-base text-text-primary flex items-center gap-2">
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
            value={tipo}
            onChange={(event) => { setTipo(event.target.value as ResourceType); setSelectedId(""); }}
            className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary"
          >
            <option value="profesional">Profesional</option>
            <option value="sucursal">Sucursal</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-text-secondary">
          {tipo === "sucursal" ? "Sucursal" : "Profesional"}
          <select
            value={recursoId ?? ""}
            onChange={(event) => setSelectedId(event.target.value)}
            className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary"
          >
            {resources.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
      </div>

      {canWrite && recursoId && (
        <div className="rounded-xl border border-border bg-surface-alt p-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-text-secondary">
              Fecha
              <input type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm" />
            </label>
            <label className="text-xs font-semibold text-text-secondary">
              Motivo opcional
              <input value={motivo} maxLength={200} onChange={(event) => setMotivo(event.target.value)} className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm" placeholder="Festivo, capacitación…" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <input type="checkbox" checked={cerrado} onChange={(event) => setCerrado(event.target.checked)} />
            Cierre completo ese día
          </label>
          {!cerrado && (
            <div className="space-y-2">
              {bloques.map((block, index) => (
                <div key={index} className="flex items-end gap-2">
                  <label className="flex-1 text-xs text-text-secondary">Inicio
                    <input type="time" value={block.inicio} onChange={(event) => setBloques((current) => current.map((item, i) => i === index ? { ...item, inicio: event.target.value } : item))} className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-3 font-mono text-sm" />
                  </label>
                  <label className="flex-1 text-xs text-text-secondary">Fin
                    <input type="time" value={block.fin} onChange={(event) => setBloques((current) => current.map((item, i) => i === index ? { ...item, fin: event.target.value } : item))} className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-3 font-mono text-sm" />
                  </label>
                  <Button variant="ghost" size="sm" aria-label="Eliminar bloque" disabled={bloques.length === 1} onClick={() => setBloques((current) => current.filter((_, i) => i !== index))}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={() => setBloques((current) => [...current, { inicio: "14:00", fin: "17:00" }])}>
                <Plus className="size-4" /> Añadir bloque
              </Button>
            </div>
          )}
          <Button onClick={saveSchedule} disabled={save.isPending || !fecha}>
            <Save className="size-4" /> {save.isPending ? "Guardando…" : "Guardar horario"}
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {schedules.isLoading && <p className="text-sm text-text-muted">Cargando horarios…</p>}
        {!schedules.isLoading && grouped.length === 0 && <p className="text-sm text-text-muted">No hay horarios especiales registrados.</p>}
        {grouped.map(([date, rows]) => (
          <div key={date} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border p-3">
            <div>
              <p className="font-mono text-sm font-bold text-text-primary">{date}</p>
              <p className="text-xs text-text-secondary">
                {rows[0].cerrado ? "Cierre completo" : rows.map((row) => `${row.inicio?.slice(0, 5)}–${row.fin?.slice(0, 5)}`).join(", ")}
                {rows[0].motivo ? ` · ${rows[0].motivo}` : ""}
              </p>
            </div>
            {canWrite && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => editSchedule(date, rows)}><Pencil className="size-4" /> Editar</Button>
                <Button variant="ghost" size="sm" onClick={() => deleteSchedule(date)} disabled={remove.isPending}><Trash2 className="size-4" /> Eliminar</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
