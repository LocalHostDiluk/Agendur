"use client";
import { CalendarDays, Pencil, UserX, UserCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { UnifiedColaborador } from "@/app/(negocio)/personal/page";
interface PersonalColaboradorActionsProps {
  colab: UnifiedColaborador;
  esActivo: boolean;
  setActiveTab: (tab: "directorio" | "horarios") => void;
  setColaboradorAEditar: (colab: UnifiedColaborador | null) => void;
  setIsEditModalOpen: (open: boolean) => void;
  handleToggleActivo: (colab: UnifiedColaborador) => Promise<void>;
  handleEliminarColaborador: (colab: UnifiedColaborador) => Promise<void>;
}
export function PersonalColaboradorActions({ colab, esActivo, setActiveTab, setColaboradorAEditar,
  setIsEditModalOpen, handleToggleActivo, handleEliminarColaborador }: PersonalColaboradorActionsProps) {
  return (
    <>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setActiveTab("horarios")}
                            className="gap-1 text-xs"
                          >
                            <CalendarDays className="w-3.5 h-3.5 text-grape" />
                            <span>Ver horarios</span>
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            title="Editar colaborador"
                            onClick={() => {
                              setColaboradorAEditar(colab);
                              setIsEditModalOpen(true);
                            }}
                            aria-label={`Editar a ${colab.nombre}`}
                            className="p-1.5"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            type="button"
                            variant={esActivo ? "ghost" : "secondary"}
                            size="sm"
                            title={
                              esActivo
                                ? "Desactivar colaborador"
                                : "Reactivar colaborador"
                            }
                            onClick={() => handleToggleActivo(colab)}
                            aria-label={
                              esActivo
                                ? `Desactivar a ${colab.nombre}`
                                : `Activar a ${colab.nombre}`
                            }
                            className={`p-1.5 ${
                              esActivo
                                ? "text-danger hover:bg-danger/10"
                                : "text-mint-dark hover:bg-mint/10"
                            }`}
                          >
                            {esActivo ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            title="Eliminar colaborador"
                            onClick={() => handleEliminarColaborador(colab)}
                            aria-label={`Eliminar a ${colab.nombre}`}
                            className="p-1.5 text-danger hover:bg-danger/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
    </>
  );
}
