"use client";

import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PersonalEmptyProps {
  searchQuery: string;
  onClearSearch: () => void;
  onOpenNuevo: () => void;
}

export function PersonalEmpty({
  searchQuery,
  onClearSearch,
  onOpenNuevo,
}: PersonalEmptyProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-10 text-center space-y-4 max-w-md mx-auto my-8">
      <div className="size-14 rounded-2xl bg-grape/10 border border-grape/20 text-grape flex items-center justify-center mx-auto">
        <Users className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bricolage font-bold text-lg text-text-primary">
          {searchQuery
            ? "No se encontraron colaboradores"
            : "Aún no tienes personal registrado"}
        </h3>
        <p className="text-xs text-text-secondary">
          {searchQuery
            ? "Intenta con otro término de búsqueda o limpia los filtros."
            : "Agrega a tus especialistas y personal para que tus clientes puedan reservar turnos directamente con ellos."}
        </p>
      </div>
      <Button
        type="button"
        variant="primary"
        onClick={() => {
          if (searchQuery) onClearSearch();
          else onOpenNuevo();
        }}
        className="gap-2 mx-auto"
      >
        <UserPlus className="w-4 h-4" />
        <span>
          {searchQuery ? "Limpiar búsqueda" : "Registrar primer colaborador"}
        </span>
      </Button>
    </div>
  );
}
