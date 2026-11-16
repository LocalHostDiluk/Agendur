"use client";

import React from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SpecialBlock } from "@/lib/hooks/use-horarios-especiales-state";

export interface HorariosEspecialesFormProps {
  fecha: string;
  onChangeFecha: (val: string) => void;
  motivo: string;
  onChangeMotivo: (val: string) => void;
  cerrado: boolean;
  onChangeCerrado: (val: boolean) => void;
  bloques: SpecialBlock[];
  onChangeBloques: React.Dispatch<React.SetStateAction<SpecialBlock[]>>;
  onSave: () => void;
  isSaving: boolean;
}

export function HorariosEspecialesForm({
  fecha,
  onChangeFecha,
  motivo,
  onChangeMotivo,
  cerrado,
  onChangeCerrado,
  bloques,
  onChangeBloques,
  onSave,
  isSaving,
}: HorariosEspecialesFormProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-alt p-4 space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs font-semibold text-text-secondary">
          Fecha
          <input
            type="date"
            value={fecha}
            onChange={(event) => onChangeFecha(event.target.value)}
            className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm"
          />
        </label>
        <label className="text-xs font-semibold text-text-secondary">
          Motivo opcional
          <input
            value={motivo}
            maxLength={200}
            onChange={(event) => onChangeMotivo(event.target.value)}
            className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm"
            placeholder="Festivo, capacitación…"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
        <input
          type="checkbox"
          checked={cerrado}
          onChange={(event) => onChangeCerrado(event.target.checked)}
        />
        Cierre completo ese día
      </label>
      {!cerrado && (
        <div className="space-y-2">
          {bloques.map((block, index) => (
            <div key={index} className="flex items-end gap-2">
              <label className="flex-1 text-xs text-text-secondary">
                Inicio
                <input
                  type="time"
                  value={block.inicio}
                  onChange={(event) =>
                    onChangeBloques((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, inicio: event.target.value } : item,
                      ),
                    )
                  }
                  className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-3 font-mono text-sm"
                />
              </label>
              <label className="flex-1 text-xs text-text-secondary">
                Fin
                <input
                  type="time"
                  value={block.fin}
                  onChange={(event) =>
                    onChangeBloques((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, fin: event.target.value } : item,
                      ),
                    )
                  }
                  className="mt-1 w-full h-10 rounded-lg border border-border bg-surface px-3 font-mono text-sm"
                />
              </label>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Eliminar bloque"
                disabled={bloques.length === 1}
                onClick={() =>
                  onChangeBloques((current) => current.filter((_, i) => i !== index))
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              onChangeBloques((current) => [
                ...current,
                { inicio: "14:00", fin: "17:00" },
              ])
            }
          >
            <Plus className="size-4" /> Añadir bloque
          </Button>
        </div>
      )}
      <Button onClick={onSave} disabled={isSaving || !fecha}>
        <Save className="size-4" /> {isSaving ? "Guardando…" : "Guardar horario"}
      </Button>
    </div>
  );
}
