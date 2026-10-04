"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Store,
  Sparkles,
  Plus,
  MapPin,
  Phone,
  Users,
  Clock,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Scissors,
  Building2,
  Trash2,
  Download,
  ArrowUpDown,
  Pencil,
} from "lucide-react";
import {
  useAuthMe,
  useSucursales,
  useServicios,
  useUpdateServicio,
  useConfirmDialog,
} from "@/lib/hooks";
import { ModalNuevaSucursal } from "@/components/negocio/ModalNuevaSucursal";
import { ModalEditarSucursal } from "@/components/negocio/ModalEditarSucursal";
import { ModalHorariosSucursal } from "@/components/negocio/ModalHorariosSucursal";
import { ModalNuevoServicio } from "@/components/negocio/ModalNuevoServicio";
import { ModalEditarServicio } from "@/components/negocio/ModalEditarServicio";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PendingBadge } from "@/components/ui/PendingBadge";
import { SkeletonBlock, SkeletonText } from "@/components/ui/Skeleton";
import { notify } from "@/lib/utils/toast";
import type { Sucursal, Servicio } from "@/lib/types";

export default function SucursalesPage() {
  const [activeTab, setActiveTab] = useState<"sucursales" | "servicios">(
    "sucursales",
  );
  const [modalSucursalOpen, setModalSucursalOpen] = useState(false);
  const [modalServicioOpen, setModalServicioOpen] = useState(false);
  const [updatingServiceId, setUpdatingServiceId] = useState<string | null>(
    null,
  );
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null);
  const [scheduleSucursal, setScheduleSucursal] = useState<Sucursal | null>(null);

  const confirmDialog = useConfirmDialog();

  const { data: auth } = useAuthMe();
  const {
    data: sucursalesData,
    isLoading: loadingSucursales,
    isError: errorSucursales,
    refetch: refetchSucursales,
  } = useSucursales();

  const {
    data: serviciosData,
    isLoading: loadingServicios,
    isError: errorServicios,
    refetch: refetchServicios,
  } = useServicios();

  const updateServicio = useUpdateServicio();

  const sucursales: (Sucursal & { personal?: number })[] =
    sucursalesData?.sucursales ?? [];
  const servicios: Servicio[] = serviciosData?.servicios ?? [];
  const negocioSlug = auth?.negocio?.slug;

  const handleToggleServicioActivo = async (
    id: string,
    activoActual: boolean,
  ) => {
    try {
      setUpdatingServiceId(id);
      await updateServicio.mutateAsync({
        id,
        activo: !activoActual,
      });
      notify.success(
        !activoActual ? "Servicio activado" : "Servicio pausado",
        !activoActual
          ? "El servicio vuelve a estar disponible para reservas."
          : "El servicio ya no aparecerá en el portal de clientes.",
      );
    } catch (err: unknown) {
      notify.error(err, "No se pudo actualizar el servicio.");
    } finally {
      setUpdatingServiceId(null);
    }
  };

  const handleDeleteSucursal = async (suc: Sucursal) => {
    const confirmado = await confirmDialog.confirm({
      type: "eliminar_sucursal",
      level: 2,
      targetName: suc.nombre,
      verificationText: suc.nombre,
    });
    if (!confirmado) return;

    try {
      const res = await fetch(`/api/negocio/sucursales?id=${encodeURIComponent(suc.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg =
          typeof errData?.error === "string"
            ? errData.error
            : errData?.error?.message || errData?.message || "No se pudo eliminar la sucursal.";
        throw new Error(msg);
      }
      notify.success(
        "Sucursal eliminada",
        `La sucursal "${suc.nombre}" ha sido eliminada.`,
      );
      refetchSucursales();
    } catch (err: unknown) {
      notify.error(err, "No se pudo eliminar la sucursal.");
    }
  };

  const handleDeleteServicio = async (serv: Servicio) => {
    const confirmado = await confirmDialog.confirm({
      type: "eliminar_servicio",
      level: 2,
      targetName: serv.nombre,
      verificationText: serv.nombre,
    });
    if (!confirmado) return;

    try {
      const res = await fetch(`/api/negocio/servicios?id=${encodeURIComponent(serv.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || "Error al eliminar el servicio.");
      }
      notify.success(
        "Servicio eliminado",
        `El servicio "${serv.nombre}" ha sido eliminado.`,
      );
      refetchServicios();
    } catch (err: unknown) {
      notify.error(err, "No se pudo eliminar el servicio.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header con acción contextual según pestaña activa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
            Servicios y sucursales
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Administra las sedes físicas de tu negocio y el catálogo de
            servicios ofrecidos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "sucursales" ? (
            <Button
              variant="primary"
              onClick={() => setModalSucursalOpen(true)}
              className="min-h-[44px]"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>Agregar Sucursal</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setModalServicioOpen(true)}
              className="min-h-[44px]"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>Agregar Servicio</span>
            </Button>
          )}
        </div>
      </div>

      {/* 1. Selector canónico de pestañas & pendientes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div
          role="tablist"
          aria-label="Pestañas de sedes y servicios"
          className="inline-flex items-center p-1 bg-surface-alt/70 border border-border rounded-xl text-xs sm:text-sm font-medium"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "sucursales"}
            aria-controls="panel-sucursales"
            id="tab-sucursales"
            onClick={() => setActiveTab("sucursales")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all min-h-[36px] cursor-pointer ${
              activeTab === "sucursales"
                ? "bg-surface text-text-primary shadow-xs font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Store className="w-4 h-4" strokeWidth={1.75} />
            <span>Sucursales</span>
            <span
              className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === "sucursales"
                  ? "bg-grape-soft text-grape font-bold"
                  : "bg-border/60 text-text-muted"
              }`}
            >
              {loadingSucursales ? "…" : sucursales.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "servicios"}
            aria-controls="panel-servicios"
            id="tab-servicios"
            onClick={() => setActiveTab("servicios")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all min-h-[36px] cursor-pointer ${
              activeTab === "servicios"
                ? "bg-surface text-text-primary shadow-xs font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.75} />
            <span>Servicios</span>
            <span
              className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === "servicios"
                  ? "bg-grape-soft text-grape font-bold"
                  : "bg-border/60 text-text-muted"
              }`}
            >
              {loadingServicios ? "…" : servicios.length}
            </span>
          </button>
        </div>

        {/* 5. Opciones avanzadas con marcas de pendientes */}
        <div className="flex items-center gap-2">
          {activeTab === "servicios" ? (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-text-secondary"
                disabled
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Reordenar</span>
                <PendingBadge
                  label="Pendiente"
                  tooltip="Ordenamiento drag & drop de catálogo en desarrollo"
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-text-secondary"
                disabled
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
                <PendingBadge
                  label="Pendiente"
                  tooltip="Exportación en formato CSV/Excel en desarrollo"
                />
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-text-secondary"
                disabled
              >
                <Sparkles className="w-3.5 h-3.5 text-grape" />
                <span>Sincronizar Google Business</span>
                <PendingBadge
                  label="Pendiente"
                  tooltip="Sincronización automática de sucursales con Google Business"
                />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* PESTAÑA: SUCURSALES */}
      {activeTab === "sucursales" && (
        <section
          id="panel-sucursales"
          role="tabpanel"
          aria-labelledby="tab-sucursales"
          className="space-y-6"
        >
          {loadingSucursales && (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse"
              data-testid="sucursales-loading"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-surface border border-border space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <SkeletonBlock className="w-10 h-10 rounded-xl" />
                    <SkeletonBlock className="w-16 h-5 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <SkeletonText className="w-3/4 h-5" />
                    <SkeletonText className="w-full h-4" />
                    <SkeletonText className="w-1/2 h-4" />
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between items-center">
                    <SkeletonText className="w-24 h-4" />
                    <SkeletonText className="w-16 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingSucursales && errorSucursales && (
            <div className="p-8 rounded-2xl bg-surface border border-danger/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-text-primary">
                  No se pudieron cargar las sucursales
                </h3>
                <p className="text-xs text-text-secondary max-w-md mx-auto">
                  Ocurrió un problema de conexión con el servidor. Intenta
                  recargar la información.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetchSucursales()}
                className="min-h-[44px]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar</span>
              </Button>
            </div>
          )}

          {!loadingSucursales &&
            !errorSucursales &&
            sucursales.length === 0 && (
              <div className="p-12 rounded-2xl bg-surface border border-dashed border-border text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-grape-soft text-grape flex items-center justify-center mx-auto">
                  <Building2 className="w-7 h-7" strokeWidth={1.75} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bricolage font-bold text-text-primary">
                    Aún no tienes sucursales registradas
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto">
                    Agrega tu primera sede física con su dirección y horario
                    para comenzar a recibir reservas.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => setModalSucursalOpen(true)}
                  className="min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear primera sucursal</span>
                </Button>
              </div>
            )}

          {!loadingSucursales && !errorSucursales && sucursales.length > 0 && (
            <div className="space-y-4">
              {/* 2. Tabla Desktop (hidden sm:table) */}
              <div className="hidden sm:block rounded-2xl bg-surface border border-border overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="hidden sm:table w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-alt border-b border-border text-[11px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        <th scope="col" className="py-3.5 px-4 sm:px-6">
                          Sucursal
                        </th>
                        <th scope="col" className="py-3.5 px-4">
                          Dirección
                        </th>
                        <th scope="col" className="py-3.5 px-4">
                          Teléfono
                        </th>
                        <th scope="col" className="py-3.5 px-4 text-center">
                          Equipo
                        </th>
                        <th scope="col" className="py-3.5 px-4 text-center">
                          Estado
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 px-4 sm:px-6 text-right"
                        >
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs sm:text-sm">
                      {sucursales.map((suc) => (
                        <tr
                          key={suc.id}
                          className="hover:bg-surface-alt/50 transition-colors"
                        >
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-grape-soft text-grape flex items-center justify-center shrink-0">
                                <Store className="w-4 h-4" strokeWidth={1.75} />
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-semibold text-text-primary block">
                                  {suc.nombre}
                                </span>
                                {suc.es_matriz && (
                                  <Badge variant="neutral" size="sm" dot={false}>
                                    MATRIZ
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-mono text-xs text-text-secondary flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-grape shrink-0" />
                              <span>
                                {suc.direccion}
                                {suc.ciudad ? ` · ${suc.ciudad}` : ""}
                                {suc.estado_provincia
                                  ? `, ${suc.estado_provincia}`
                                  : ""}
                              </span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono text-xs text-text-primary flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
                              <span>{suc.telefono}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-xs text-text-secondary font-medium">
                              <Users className="w-3.5 h-3.5 text-text-muted" />
                              <span>
                                {suc.personalCount ?? suc.personal ?? 0}{" "}
                                Profesionales
                              </span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <Badge
                              variant={suc.activa ? "success" : "neutral"}
                              size="sm"
                              dot
                            >
                              {suc.activa ? "ACTIVA" : "INACTIVA"}
                            </Badge>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {negocioSlug && (
                                <Link
                                  href={`/reserva/${negocioSlug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-grape hover:underline font-semibold text-xs p-1"
                                  aria-label={`Ver portal público de reservas para ${suc.nombre}`}
                                >
                                  <span>Portal público</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setScheduleSucursal(suc)}
                                aria-label={`Gestionar horario de sucursal ${suc.nombre}`}
                                className="h-8 px-2.5 text-xs"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">Horario</span>
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setEditingSucursal(suc)}
                                aria-label={`Editar sucursal ${suc.nombre}`}
                                className="h-8 px-2.5 text-xs"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">Editar</span>
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteSucursal(suc)}
                                aria-label={`Eliminar sucursal ${suc.nombre}`}
                                className="h-8 px-2.5 text-xs"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">Eliminar</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Transformación Responsive Mobile (block sm:hidden) con pares clave:valor */}
              <div className="block sm:hidden space-y-4">
                {sucursales.map((suc) => (
                  <div
                    key={suc.id}
                    className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-grape-soft text-grape flex items-center justify-center shrink-0">
                          <Store className="w-4 h-4" strokeWidth={1.75} />
                        </div>
                        <h3 className="font-bricolage font-bold text-base text-text-primary leading-tight">
                          {suc.nombre}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {suc.es_matriz && (
                          <Badge variant="neutral" size="sm" dot={false}>
                            MATRIZ
                          </Badge>
                        )}
                        <Badge
                          variant={suc.activa ? "success" : "neutral"}
                          size="sm"
                          dot
                        >
                          {suc.activa ? "ACTIVA" : "INACTIVA"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 border-t border-border/60 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-text-muted font-medium">
                          Dirección:
                        </span>
                        <span className="font-mono text-text-secondary text-right">
                          {suc.direccion}
                          {suc.ciudad ? ` · ${suc.ciudad}` : ""}
                          {suc.estado_provincia
                            ? `, ${suc.estado_provincia}`
                            : ""}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-text-muted font-medium">
                          Teléfono:
                        </span>
                        <span className="font-mono text-text-primary font-semibold">
                          {suc.telefono}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-text-muted font-medium">
                          Equipo:
                        </span>
                        <span className="text-text-secondary">
                          {suc.personalCount ?? suc.personal ?? 0} Profesionales
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                      {negocioSlug && (
                        <Link
                          href={`/reserva/${negocioSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-grape hover:underline font-semibold text-xs"
                          aria-label={`Ver portal público de reservas para ${suc.nombre}`}
                        >
                          <span>Portal público</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setScheduleSucursal(suc)}
                          aria-label={`Gestionar horario de sucursal ${suc.nombre}`}
                          className="h-8 px-2 text-xs"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Horario</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingSucursal(suc)}
                          aria-label={`Editar sucursal ${suc.nombre}`}
                          className="h-8 px-2 text-xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteSucursal(suc)}
                          aria-label={`Eliminar sucursal ${suc.nombre}`}
                          className="h-8 px-2 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* PESTAÑA: SERVICIOS */}
      {activeTab === "servicios" && (
        <section
          id="panel-servicios"
          role="tabpanel"
          aria-labelledby="tab-servicios"
          className="space-y-6"
        >
          {loadingServicios && (
            <div
              className="rounded-2xl bg-surface border border-border p-6 space-y-4 animate-pulse"
              data-testid="servicios-loading"
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-3 border-b border-border last:border-0"
                >
                  <div className="space-y-1.5 w-1/3">
                    <SkeletonText className="h-4 w-3/4" />
                    <SkeletonText className="h-3 w-1/2" />
                  </div>
                  <SkeletonText className="h-4 w-16" />
                  <SkeletonText className="h-4 w-20" />
                  <SkeletonBlock className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {!loadingServicios && errorServicios && (
            <div className="p-8 rounded-2xl bg-surface border border-danger/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-text-primary">
                  No se pudieron cargar los servicios
                </h3>
                <p className="text-xs text-text-secondary max-w-md mx-auto">
                  Ocurrió un problema de conexión con el catálogo. Intenta
                  recargar la información.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetchServicios()}
                className="min-h-[44px]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar</span>
              </Button>
            </div>
          )}

          {!loadingServicios && !errorServicios && servicios.length === 0 && (
            <div className="p-12 rounded-2xl bg-surface border border-dashed border-border text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-grape-soft text-grape flex items-center justify-center mx-auto">
                <Scissors className="w-7 h-7" strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bricolage font-bold text-text-primary">
                  Tu catálogo de servicios está vacío
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto">
                  Agrega los servicios que ofreces (ej. cortes, tratamientos,
                  consultas) con su duración estimada y precio.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setModalServicioOpen(true)}
                className="min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Crear primer servicio</span>
              </Button>
            </div>
          )}

          {!loadingServicios && !errorServicios && servicios.length > 0 && (
            <div className="space-y-4">
              {/* 2. Tabla Desktop (hidden sm:table) */}
              <div className="hidden sm:block rounded-2xl bg-surface border border-border overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="hidden sm:table w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-alt border-b border-border text-[11px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        <th scope="col" className="py-3.5 px-4 sm:px-6">
                          Servicio
                        </th>
                        <th scope="col" className="py-3.5 px-4 text-center">
                          Duración
                        </th>
                        <th scope="col" className="py-3.5 px-4 text-right">
                          Precio
                        </th>
                        <th scope="col" className="py-3.5 px-4 text-center">
                          Estado
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 px-4 sm:px-6 text-right"
                        >
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs sm:text-sm">
                      {servicios.map((s) => {
                        const duracion =
                          s.duracion_minutos ?? s.duracionMinutos ?? 30;
                        const isActivo = s.activo !== false;
                        const isUpdating = updatingServiceId === s.id;

                        return (
                          <tr
                            key={s.id}
                            className="hover:bg-surface-alt/50 transition-colors"
                          >
                            <td className="py-3.5 px-4 sm:px-6">
                              <div className="space-y-0.5">
                                <span className="font-semibold text-text-primary block">
                                  {s.nombre}
                                </span>
                                {s.descripcion && (
                                  <p className="text-xs text-text-secondary line-clamp-1 max-w-xs sm:max-w-md">
                                    {s.descripcion}
                                  </p>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 font-mono text-text-primary px-2.5 py-1 rounded-md bg-surface-alt border border-border/70 text-xs">
                                <Clock className="w-3 h-3 text-text-muted" />
                                <span>{duracion} min</span>
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <span className="font-mono font-bold text-text-primary">
                                $
                                {Number(s.precio).toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}{" "}
                                <span className="text-[10px] text-text-muted font-normal">
                                  MXN
                                </span>
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <Badge
                                variant={isActivo ? "success" : "neutral"}
                                size="sm"
                                dot
                              >
                                {isActivo ? "ACTIVA" : "PAUSADA"}
                              </Badge>
                            </td>

                            <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingServicio(s)}
                                  aria-label={`Editar servicio ${s.nombre}`}
                                  className="h-8 px-2.5 text-xs"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span className="hidden lg:inline">Editar</span>
                                </Button>
                                <Button
                                  variant={isActivo ? "outline" : "secondary"}
                                  size="sm"
                                  disabled={isUpdating}
                                  onClick={() =>
                                    handleToggleServicioActivo(s.id, isActivo)
                                  }
                                  aria-label={
                                    isActivo
                                      ? `Pausar servicio ${s.nombre}`
                                      : `Activar servicio ${s.nombre}`
                                  }
                                  className="h-8 px-3 text-xs"
                                >
                                  {isUpdating
                                    ? "…"
                                    : isActivo
                                      ? "Pausar"
                                      : "Activar"}
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteServicio(s)}
                                  aria-label={`Eliminar servicio ${s.nombre}`}
                                  className="h-8 px-2.5 text-xs"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="hidden lg:inline">Eliminar</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Transformación Responsive Mobile (block sm:hidden) con pares clave:valor */}
              <div className="block sm:hidden space-y-4">
                {servicios.map((s) => {
                  const duracion =
                    s.duracion_minutos ?? s.duracionMinutos ?? 30;
                  const isActivo = s.activo !== false;
                  const isUpdating = updatingServiceId === s.id;

                  return (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <h3 className="font-bricolage font-bold text-base text-text-primary">
                            {s.nombre}
                          </h3>
                          {s.descripcion && (
                            <p className="text-xs text-text-secondary line-clamp-2">
                              {s.descripcion}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={isActivo ? "success" : "neutral"}
                          size="sm"
                          dot
                        >
                          {isActivo ? "ACTIVA" : "PAUSADA"}
                        </Badge>
                      </div>

                      <div className="space-y-2 pt-1 border-t border-border/60 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-text-muted font-medium">
                            Duración:
                          </span>
                          <span className="font-mono font-semibold text-text-primary inline-flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-text-muted" />
                            <span>{duracion} min</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-text-muted font-medium">
                            Precio:
                          </span>
                          <span className="font-mono font-bold text-text-primary text-sm">
                            $
                            {Number(s.precio).toLocaleString("es-MX", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            <span className="text-[10px] text-text-muted font-normal">
                              MXN
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingServicio(s)}
                          aria-label={`Editar servicio ${s.nombre}`}
                          className="h-8 px-2.5 text-xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </Button>
                        <Button
                          variant={isActivo ? "outline" : "secondary"}
                          size="sm"
                          disabled={isUpdating}
                          onClick={() =>
                            handleToggleServicioActivo(s.id, isActivo)
                          }
                          aria-label={
                            isActivo
                              ? `Pausar servicio ${s.nombre}`
                              : `Activar servicio ${s.nombre}`
                          }
                          className="h-8 px-3 text-xs"
                        >
                          {isUpdating
                            ? "…"
                            : isActivo
                              ? "Pausar"
                              : "Activar"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteServicio(s)}
                          aria-label={`Eliminar servicio ${s.nombre}`}
                          className="h-8 px-2.5 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Modales de Creación */}
      <ModalNuevaSucursal
        isOpen={modalSucursalOpen}
        onClose={() => setModalSucursalOpen(false)}
      />

      <ModalNuevoServicio
        isOpen={modalServicioOpen}
        onClose={() => setModalServicioOpen(false)}
      />

      <ModalEditarServicio
        isOpen={Boolean(editingServicio)}
        onClose={() => setEditingServicio(null)}
        servicio={editingServicio}
        onSuccess={() => refetchServicios()}
      />

      <ModalEditarSucursal
        isOpen={Boolean(editingSucursal)}
        onClose={() => setEditingSucursal(null)}
        sucursal={editingSucursal}
        onSuccess={() => refetchSucursales()}
      />

      <ModalHorariosSucursal
        isOpen={Boolean(scheduleSucursal)}
        onClose={() => setScheduleSucursal(null)}
        sucursal={scheduleSucursal}
      />

      {/* 4. Confirmación Crítica Nivel 2 */}
      <ConfirmDialog {...confirmDialog.dialogProps} />
    </div>
  );
}
