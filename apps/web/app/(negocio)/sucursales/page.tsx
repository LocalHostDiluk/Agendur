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
  CheckCircle2,
  XCircle,
  Scissors,
  Building2,
} from "lucide-react";
import {
  useAuthMe,
  useSucursales,
  useServicios,
  useUpdateServicio,
} from "@/lib/hooks";
import { ModalNuevaSucursal } from "@/components/negocio/ModalNuevaSucursal";
import { ModalNuevoServicio } from "@/components/negocio/ModalNuevoServicio";
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
            <button
              type="button"
              onClick={() => setModalSucursalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-grape hover:bg-grape/90 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>Agregar Sucursal</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setModalServicioOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-grape hover:bg-grape/90 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>Agregar Servicio</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-3">
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
      </div>

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
              <button
                type="button"
                onClick={() => refetchSucursales()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-alt hover:bg-surface border border-border text-text-primary text-xs font-semibold cursor-pointer min-h-[44px]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar</span>
              </button>
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
                <button
                  type="button"
                  onClick={() => setModalSucursalOpen(true)}
                  className="inline-flex items-center gap-2 bg-grape hover:bg-grape/90 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl cursor-pointer min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear primera sucursal</span>
                </button>
              </div>
            )}

          {!loadingSucursales && !errorSucursales && sucursales.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {sucursales.map((suc) => (
                <div
                  key={suc.id}
                  className="p-5 sm:p-6 rounded-2xl bg-surface border border-border hover:border-grape/30 transition-all flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="w-10 h-10 rounded-xl bg-grape-soft text-grape flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {suc.es_matriz && (
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-grape-soft text-grape border border-grape/20">
                            MATRIZ
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                            suc.activa
                              ? "bg-mint-soft text-mint-dark border-mint/20"
                              : "bg-surface-alt text-text-muted border-border"
                          }`}
                        >
                          {suc.activa ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-mint" />
                              <span>ACTIVA</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-text-muted" />
                              <span>INACTIVA</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bricolage font-bold text-text-primary text-base sm:text-lg leading-snug">
                        {suc.nombre}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1.5 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-grape shrink-0 mt-0.5" />
                        <span>
                          {suc.direccion}
                          {suc.ciudad ? ` · ${suc.ciudad}` : ""}
                          {suc.estado_provincia
                            ? `, ${suc.estado_provincia}`
                            : ""}
                        </span>
                      </p>
                      <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span className="font-mono">{suc.telefono}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-text-secondary font-medium">
                      <Users className="w-3.5 h-3.5 text-text-muted" />
                      <span>
                        {suc.personalCount ?? suc.personal ?? 0} Profesionales
                      </span>
                    </span>

                    {negocioSlug && (
                      <Link
                        href={`/reserva/${negocioSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-grape hover:underline font-semibold text-[11px] p-1"
                        aria-label={`Ver portal público de reservas para ${suc.nombre}`}
                      >
                        <span>Portal público</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

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
              <button
                type="button"
                onClick={() => refetchServicios()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-alt hover:bg-surface border border-border text-text-primary text-xs font-semibold cursor-pointer min-h-[44px]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar</span>
              </button>
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
              <button
                type="button"
                onClick={() => setModalServicioOpen(true)}
                className="inline-flex items-center gap-2 bg-grape hover:bg-grape/90 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl cursor-pointer min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Crear primer servicio</span>
              </button>
            </div>
          )}

          {!loadingServicios && !errorServicios && servicios.length > 0 && (
            <div className="rounded-2xl bg-surface border border-border overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
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
                        Acción
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
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                                isActivo
                                  ? "bg-mint-soft text-mint-dark border-mint/20"
                                  : "bg-surface-alt text-text-muted border-border"
                              }`}
                            >
                              {isActivo ? "ACTIVO" : "PAUSADO"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleToggleServicioActivo(s.id, isActivo)
                              }
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer min-h-[32px] ${
                                isActivo
                                  ? "border-border text-text-secondary hover:bg-surface-alt hover:text-text-primary"
                                  : "border-mint/30 bg-mint-soft text-mint-dark hover:bg-mint/20"
                              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                              aria-label={
                                isActivo
                                  ? `Pausar servicio ${s.nombre}`
                                  : `Activar servicio ${s.nombre}`
                              }
                            >
                              {isUpdating
                                ? "…"
                                : isActivo
                                  ? "Pausar"
                                  : "Activar"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      <ModalNuevaSucursal
        isOpen={modalSucursalOpen}
        onClose={() => setModalSucursalOpen(false)}
      />

      <ModalNuevoServicio
        isOpen={modalServicioOpen}
        onClose={() => setModalServicioOpen(false)}
      />
    </div>
  );
}
