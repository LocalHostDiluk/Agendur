"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Store,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { notify } from "@/lib/utils/toast";
import { useAuthMe, useCitasNegocio, useSuscripcion } from "@/lib/hooks";

export default function DashboardPage() {
  const [copied, setCopied] = useState(false);
  const { data: auth } = useAuthMe();
  const { data: suscripcionResponse } = useSuscripcion();
  const { data: citasResponse } = useCitasNegocio();
  const negocio = auth?.negocio;
  const suscripcion = suscripcionResponse?.data.suscripcion ?? auth?.suscripcion;
  const citas = citasResponse?.citas ?? [];
  const hoy = new Date().toISOString().slice(0, 10);
  const citasHoy = citasResponse?.citas?.filter((cita) => cita.fecha === hoy);
  const citasPendientes = citasHoy?.filter((cita) => cita.estado === "pendiente_pago");
  const ingresosConfirmados = citasResponse?.citas
    ?.filter((cita) => cita.estado === "confirmada")
    .reduce((total, cita) => total + (cita.precio_total ?? 0), 0);
  const negocioSlug = negocio?.slug;
  const planNombre = suscripcion?.plan_nombre ?? "—";
  const sucursalesUsadas = suscripcionResponse?.data.sucursales_usadas ?? "—";
  const sucursalesLimite =
    suscripcionResponse?.data.sucursales_limite ?? suscripcion?.limite_sucursales ?? "—";

  const copyBookingUrl = () => {
    if (!negocioSlug) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/reserva/${negocioSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    notify.success("Enlace copiado", "Se copió el enlace al portapapeles.");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "confirmada":
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            Confirmada
          </span>
        );
      case "pendiente_pago":
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            Pendiente Pago
          </span>
        );
      case "completada":
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            Completada
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 text-white shadow-xl shadow-indigo-600/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold uppercase tracking-wider">
            <span>Plan {planNombre}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-300 font-normal">Activo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hola, {negocio?.nombre_comercial ?? "—"}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
            Tu portal de reservas está activo y listo para recibir clientes en
            línea en tus sedes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={copyBookingUrl}
            disabled={!negocioSlug}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs font-semibold border border-white/20 transition-all active:scale-95"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-300" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>
              {copied ? "¡Enlace Copiado!" : "Copiar Enlace de Reserva"}
            </span>
          </button>

          <Link
            href={negocioSlug ? `/reserva/${negocioSlug}` : "/"}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-indigo-50 text-xs font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>Ver Portal Público</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Citas Hoy */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Citas para Hoy
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {citasHoy?.length ?? "—"}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
              {citasPendientes?.length ?? "—"} pendiente
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Todas tus sucursales activas
          </p>
        </div>

        {/* Card 2: Sucursales */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Sedes Habilitadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {sucursalesUsadas}{" "}
              <span className="text-sm font-normal text-slate-400">
                / {sucursalesLimite}
              </span>
            </span>
            <Link
              href="/sucursales"
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
            >
              Gestionar <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Capacidad de tu plan: {sucursalesLimite} sedes
          </p>
        </div>

        {/* Card 3: Suscripción */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Suscripción SaaS
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-white capitalize">
              {planNombre}
            </span>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/60">
              {suscripcion?.estado ?? "—"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Facturación {suscripcion?.intervalo ?? "—"}
          </p>
        </div>

        {/* Card 4: Ingresos Proyectados */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Servicios Agendados
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {ingresosConfirmados === undefined
                ? "—"
                : `$${ingresosConfirmados.toLocaleString("es-MX")}`} {" "}
              <span className="text-xs font-normal text-slate-500">MXN</span>
            </span>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Confirmadas
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Valor total de citas confirmadas
          </p>
        </div>
      </div>

      {/* Main Appointments Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Citas Recientes y Próximas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Listado de reservaciones de clientes en tiempo real
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agendas"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20"
            >
              Ver Calendario Completo <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Sede / Sucursal</th>
                <th className="py-3 px-4">Servicio</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {citas.map((cita) => (
                <tr
                  key={cita.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {[cita.cliente_nombre ?? cita.clienteNombre, cita.cliente_apellido]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {cita.cliente_telefono ?? cita.clientePhone ?? "—"}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      {cita.sucursal_id ?? cita.sucursalId ?? "—"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {cita.servicio_id ?? cita.servicioId ?? "—"}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      <span className="font-medium">{cita.fecha}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {cita.hora_inicio ?? cita.hora ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {cita.precio_total === undefined ? "—" : `$${cita.precio_total} MXN`}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {getStatusBadge(cita.estado)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
