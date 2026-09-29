"use client";

import { useState, useMemo } from "react";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  Search,
  Filter,
  Download,
  Receipt,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  Smartphone,
  Wallet,
} from "lucide-react";
import {
  Button,
  Badge,
  PendingBadge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Modal,
} from "@/components/ui";

interface Transaccion {
  id: string;
  txCode: string;
  fecha: string;
  hora: string;
  clienteNombre: string;
  clienteEmail: string;
  servicio: string;
  sucursal: string;
  montoTotal: number;
  anticipoPagado: number;
  saldoPendiente: number;
  metodo: "stripe" | "transferencia" | "efectivo";
  estado: "pagado" | "pendiente" | "reembolsado";
  stripeChargeId?: string;
}

const TRANSACCIONES_MOCK: Transaccion[] = [
  {
    id: "tx-1",
    txCode: "#TX-9481",
    fecha: "29 Sep 2026",
    hora: "14:30",
    clienteNombre: "Valeria Morales",
    clienteEmail: "valeria.m@gmail.com",
    servicio: "Corte & Estilo Personalizado",
    sucursal: "Sucursal Matriz Centro",
    montoTotal: 650,
    anticipoPagado: 650,
    saldoPendiente: 0,
    metodo: "stripe",
    estado: "pagado",
    stripeChargeId: "ch_3Pz7x82eZvKYlo2C1g9X810",
  },
  {
    id: "tx-2",
    txCode: "#TX-9480",
    fecha: "29 Sep 2026",
    hora: "12:15",
    clienteNombre: "Rodrigo Fernández",
    clienteEmail: "rodrigo.f@outlook.com",
    servicio: "Tratamiento Facial Purificante",
    sucursal: "Sucursal Providencia",
    montoTotal: 1200,
    anticipoPagado: 360,
    saldoPendiente: 840,
    metodo: "stripe",
    estado: "pendiente",
    stripeChargeId: "ch_3Pz7a12eZvKYlo2C0p1k942",
  },
  {
    id: "tx-3",
    txCode: "#TX-9479",
    fecha: "29 Sep 2026",
    hora: "10:00",
    clienteNombre: "Camila Torres",
    clienteEmail: "camila.torres@empresa.com",
    servicio: "Manicura Rusa & Gelish",
    sucursal: "Sucursal Matriz Centro",
    montoTotal: 450,
    anticipoPagado: 450,
    saldoPendiente: 0,
    metodo: "transferencia",
    estado: "pagado",
  },
  {
    id: "tx-4",
    txCode: "#TX-9478",
    fecha: "28 Sep 2026",
    hora: "18:45",
    clienteNombre: "Sebastián Alarcón",
    clienteEmail: "sebas.alarcon@live.com",
    servicio: "Masaje Descontracturante 60min",
    sucursal: "Sucursal Valle Oriente",
    montoTotal: 950,
    anticipoPagado: 950,
    saldoPendiente: 0,
    metodo: "stripe",
    estado: "reembolsado",
    stripeChargeId: "ch_3Pz6h92eZvKYlo2C2x88910",
  },
  {
    id: "tx-5",
    txCode: "#TX-9477",
    fecha: "28 Sep 2026",
    hora: "16:20",
    clienteNombre: "Mariana Delgado",
    clienteEmail: "marian.delgado@icloud.com",
    servicio: "Diseño y Perfilado de Cejas",
    sucursal: "Sucursal Providencia",
    montoTotal: 380,
    anticipoPagado: 380,
    saldoPendiente: 0,
    metodo: "stripe",
    estado: "pagado",
    stripeChargeId: "ch_3Pz5m42eZvKYlo2C1t74198",
  },
  {
    id: "tx-6",
    txCode: "#TX-9476",
    fecha: "28 Sep 2026",
    hora: "13:00",
    clienteNombre: "Alejandro Mendoza",
    clienteEmail: "alejandro.m@yahoo.com",
    servicio: "Corte Barba & Ritual Toalla Caliente",
    sucursal: "Sucursal Matriz Centro",
    montoTotal: 520,
    anticipoPagado: 156,
    saldoPendiente: 364,
    metodo: "stripe",
    estado: "pendiente",
    stripeChargeId: "ch_3Pz4k22eZvKYlo2C8y55421",
  },
  {
    id: "tx-7",
    txCode: "#TX-9475",
    fecha: "27 Sep 2026",
    hora: "17:15",
    clienteNombre: "Lucía Paredes",
    clienteEmail: "lucia.paredes@hotmail.com",
    servicio: "Limpieza Dental con Ultrasonido",
    sucursal: "Sucursal Valle Oriente",
    montoTotal: 1100,
    anticipoPagado: 1100,
    saldoPendiente: 0,
    metodo: "transferencia",
    estado: "pagado",
  },
  {
    id: "tx-8",
    txCode: "#TX-9474",
    fecha: "27 Sep 2026",
    hora: "11:30",
    clienteNombre: "Ignacio Vega",
    clienteEmail: "ignacio.vega@gmail.com",
    servicio: "Evaluación Nutricional Inicial",
    sucursal: "Sucursal Matriz Centro",
    montoTotal: 800,
    anticipoPagado: 0,
    saldoPendiente: 800,
    metodo: "efectivo",
    estado: "pendiente",
  },
  {
    id: "tx-9",
    txCode: "#TX-9473",
    fecha: "26 Sep 2026",
    hora: "15:40",
    clienteNombre: "Daniela Rivas",
    clienteEmail: "daniela.rivas@gmail.com",
    servicio: "Depilación Láser Diodo Facial",
    sucursal: "Sucursal Providencia",
    montoTotal: 750,
    anticipoPagado: 750,
    saldoPendiente: 0,
    metodo: "stripe",
    estado: "pagado",
    stripeChargeId: "ch_3Pz2a92eZvKYlo2C4r11094",
  },
  {
    id: "tx-10",
    txCode: "#TX-9472",
    fecha: "26 Sep 2026",
    hora: "09:30",
    clienteNombre: "Héctor Salgado",
    clienteEmail: "h.salgado@corporativo.mx",
    servicio: "Pedicura Clínica Especializada",
    sucursal: "Sucursal Valle Oriente",
    montoTotal: 600,
    anticipoPagado: 600,
    saldoPendiente: 0,
    metodo: "stripe",
    estado: "pagado",
    stripeChargeId: "ch_3Pz1y72eZvKYlo2C9w22187",
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function PagosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");
  const [metodoFilter, setMetodoFilter] = useState<string>("todos");
  const [selectedTx, setSelectedTx] = useState<Transaccion | null>(null);

  // Filtered transactions
  const transaccionesFiltradas = useMemo(() => {
    return TRANSACCIONES_MOCK.filter((tx) => {
      const matchSearch =
        tx.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.clienteEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.txCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.servicio.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEstado =
        estadoFilter === "todos" ? true : tx.estado === estadoFilter;

      const matchMetodo =
        metodoFilter === "todos" ? true : tx.metodo === metodoFilter;

      return matchSearch && matchEstado && matchMetodo;
    });
  }, [searchTerm, estadoFilter, metodoFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
            Pagos y Facturación
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Supervisa los cobros de anticipos, liquidaciones presenciales y transacciones
            de pasarela en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            disabled
            className="gap-2 shrink-0"
            title="Descarga de reporte contable en desarrollo"
          >
            <Download className="w-4 h-4" />
            <span>Exportar transacciones</span>
            <PendingBadge label="Pendiente" tooltip="Descarga de reporte contable en desarrollo" />
          </Button>
        </div>
      </div>

      {/* Banner Informativo con PendingBadge (§10, §382) */}
      <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <PendingBadge
              label="Datos Simulados"
              tooltip="Módulo visual preliminar para gestión de transacciones y pasarela de cobro"
            />
            <h2 className="text-sm font-semibold text-text-primary">
              Módulo Visual Preliminar de Transacciones
            </h2>
          </div>
          <p className="text-xs text-text-secondary max-w-3xl leading-relaxed">
            Esta vista preliminar refleja el flujo de cobros procesados mediante pasarela de pago (Stripe)
            y depósitos en sede. Las transacciones mostradas a continuación ilustran la conciliación
            automática de anticipos y liquidaciones pendientes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-amber-700 dark:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg shrink-0 border border-amber-500/20">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Stripe Connect Activo</span>
        </div>
      </div>

      {/* 3 KPIs de Pagos (§10, §382, §5.3 con jerarquía obligatoria) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KPI 1: Destacada (Fondo --grape-soft sutil) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-grape-soft/40 border border-grape/30 space-y-2 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              Total Ingresos del Mes
            </span>
            <div className="size-8 rounded-lg bg-grape text-white flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-1">
            <span className="font-mono text-[32px] tabular-nums font-bold text-text-primary tracking-tight">
              $48,250.00 MXN
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-success font-medium pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs mes anterior</span>
          </div>
        </div>

        {/* KPI 2: Anticipos Recaudados */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              Anticipos Recaudados
            </span>
            <div className="size-8 rounded-lg bg-surface-alt border border-border text-grape flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-1">
            <span className="font-mono text-[32px] tabular-nums font-bold text-text-primary tracking-tight">
              $14,800.00 MXN
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-success font-medium pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>+12.1% en línea (Stripe)</span>
          </div>
        </div>

        {/* KPI 3: Pagos Pendientes */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              Pagos Pendientes
            </span>
            <div className="size-8 rounded-lg bg-surface-alt border border-border text-warning flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-1">
            <span className="font-mono text-[32px] tabular-nums font-bold text-text-primary tracking-tight">
              $5,600.00 MXN
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-warning font-medium pt-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>8 citas por liquidar en sede</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros interactiva */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, correo, servicio o ID..."
            className="w-full pl-9 pr-3.5 py-2 rounded-[var(--radius-sm)] bg-surface-alt border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[40px]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros Dropdown */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Filter className="w-3.5 h-3.5" />
            <span>Estado:</span>
          </div>
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-xs font-medium text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[40px]"
          >
            <option value="todos">Todos los estados</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="reembolsado">Reembolsado</option>
          </select>

          <select
            value={metodoFilter}
            onChange={(e) => setMetodoFilter(e.target.value)}
            className="px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border text-xs font-medium text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[40px]"
          >
            <option value="todos">Todos los métodos</option>
            <option value="stripe">Stripe (Tarjeta)</option>
            <option value="transferencia">Transferencia SPEI</option>
            <option value="efectivo">Efectivo en Sede</option>
          </select>
        </div>
      </div>

      {/* Tabla de Transacciones Desktop (§5.5) / Cards Mobile (§8) */}
      <div className="rounded-2xl bg-surface border border-border overflow-hidden shadow-xs">
        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-alt">
                <TableHead className="font-semibold text-xs text-text-secondary">ID Transacción</TableHead>
                <TableHead className="font-semibold text-xs text-text-secondary">Fecha & Hora</TableHead>
                <TableHead className="font-semibold text-xs text-text-secondary">Cliente</TableHead>
                <TableHead className="font-semibold text-xs text-text-secondary">Servicio & Sede</TableHead>
                <TableHead className="font-semibold text-xs text-text-secondary">Método</TableHead>
                <TableHead className="font-semibold text-xs text-text-secondary">Monto</TableHead>
                <TableHead className="font-semibold text-xs text-text-secondary">Estado</TableHead>
                <TableHead className="font-semibold text-xs text-text-secondary text-right">Recibo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transaccionesFiltradas.length > 0 ? (
                transaccionesFiltradas.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-surface-alt/70 transition-colors h-12">
                    {/* ID */}
                    <TableCell className="font-mono text-xs font-bold text-grape">
                      {tx.txCode}
                    </TableCell>

                    {/* Fecha */}
                    <TableCell className="text-xs text-text-secondary font-mono">
                      {tx.fecha}, {tx.hora}
                    </TableCell>

                    {/* Cliente */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-full bg-surface-alt border border-border text-grape font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                          {getInitials(tx.clienteNombre)}
                        </div>
                        <div className="text-xs">
                          <p className="font-medium text-text-primary leading-snug">
                            {tx.clienteNombre}
                          </p>
                          <p className="text-[11px] text-text-muted font-mono leading-none">
                            {tx.clienteEmail}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Servicio & Sede */}
                    <TableCell className="text-xs">
                      <p className="font-medium text-text-primary">{tx.servicio}</p>
                      <p className="text-[11px] text-text-muted">{tx.sucursal}</p>
                    </TableCell>

                    {/* Método */}
                    <TableCell className="text-xs">
                      {tx.metodo === "stripe" && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-grape">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Stripe</span>
                        </span>
                      )}
                      {tx.metodo === "transferencia" && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-secondary">
                          <Building className="w-3.5 h-3.5" />
                          <span>SPEI</span>
                        </span>
                      )}
                      {tx.metodo === "efectivo" && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-secondary">
                          <Wallet className="w-3.5 h-3.5" />
                          <span>Efectivo</span>
                        </span>
                      )}
                    </TableCell>

                    {/* Monto Space Mono */}
                    <TableCell className="font-mono text-sm font-bold text-text-primary tabular-nums">
                      ${tx.montoTotal.toFixed(2)} MXN
                    </TableCell>

                    {/* Estado Badge */}
                    <TableCell>
                      {tx.estado === "pagado" && (
                        <Badge variant="success" size="sm" dot>
                          Pagado
                        </Badge>
                      )}
                      {tx.estado === "pendiente" && (
                        <Badge variant="warning" size="sm" dot>
                          Pendiente
                        </Badge>
                      )}
                      {tx.estado === "reembolsado" && (
                        <Badge variant="danger" size="sm" dot>
                          Reembolsado
                        </Badge>
                      )}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTx(tx)}
                        className="px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-alt border border-border transition-colors inline-flex items-center gap-1"
                        aria-label={`Ver recibo de ${tx.clienteNombre}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Receipt className="w-8 h-8 text-text-muted mx-auto" />
                      <p className="font-medium text-text-primary text-sm">
                        No se encontraron transacciones
                      </p>
                      <p className="text-xs text-text-secondary">
                        Intenta ajustar los términos de búsqueda o los filtros de estado.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setEstadoFilter("todos");
                          setMetodoFilter("todos");
                        }}
                        className="mt-2 text-xs font-semibold text-grape hover:underline"
                      >
                        Restablecer filtros
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View: Cards apiladas (§8) */}
        <div className="block sm:hidden divide-y divide-border p-3 space-y-3">
          {transaccionesFiltradas.length > 0 ? (
            transaccionesFiltradas.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="p-4 rounded-xl bg-surface-alt/50 border border-border space-y-3 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-grape">
                    {tx.txCode}
                  </span>
                  {tx.estado === "pagado" && (
                    <Badge variant="success" size="sm" dot>
                      Pagado
                    </Badge>
                  )}
                  {tx.estado === "pendiente" && (
                    <Badge variant="warning" size="sm" dot>
                      Pendiente
                    </Badge>
                  )}
                  {tx.estado === "reembolsado" && (
                    <Badge variant="danger" size="sm" dot>
                      Reembolsado
                    </Badge>
                  )}
                </div>

                <div>
                  <p className="font-medium text-text-primary text-sm">
                    {tx.clienteNombre}
                  </p>
                  <p className="text-xs text-text-secondary">{tx.servicio}</p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                  <span className="font-mono text-text-secondary">{tx.fecha}</span>
                  <span className="font-mono font-bold text-text-primary">
                    ${tx.montoTotal.toFixed(2)} MXN
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center space-y-2">
              <Receipt className="w-8 h-8 text-text-muted mx-auto" />
              <p className="text-sm font-medium text-text-primary">
                Sin transacciones coincidentes
              </p>
            </div>
          )}
        </div>

        {/* Paginación §5.5 ("Mostrando 1–10 de 10") */}
        <div className="p-4 border-t border-border bg-surface-alt/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
          <span className="font-sans">
            Mostrando <span className="font-mono font-medium text-text-primary">1–{transaccionesFiltradas.length}</span> de{" "}
            <span className="font-mono font-medium text-text-primary">{TRANSACCIONES_MOCK.length}</span> transacciones
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className="px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-surface border border-border text-text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled
              className="px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-surface border border-border text-text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Recibo */}
      {selectedTx && (
        <Modal
          isOpen={Boolean(selectedTx)}
          onClose={() => setSelectedTx(null)}
          title={`Detalle de Transacción ${selectedTx.txCode}`}
          className="max-w-md"
        >
          <div className="space-y-5">
            {/* Header del Recibo */}
            <div className="p-4 rounded-xl bg-surface-alt border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-secondary">
                  Comprobante digital
                </span>
                <span className="font-mono text-xs font-bold text-grape">
                  {selectedTx.txCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-text-muted">Fecha y hora</p>
                  <p className="font-mono font-medium text-text-primary">
                    {selectedTx.fecha}, {selectedTx.hora}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted">Método de pago</p>
                  <p className="font-mono font-medium text-text-primary uppercase">
                    {selectedTx.metodo}
                  </p>
                </div>
              </div>

              {selectedTx.stripeChargeId && (
                <div className="pt-2 border-t border-border text-[11px] font-mono text-text-secondary">
                  <span>ID de Cargo Stripe: </span>
                  <span className="font-bold text-text-primary">{selectedTx.stripeChargeId}</span>
                </div>
              )}
            </div>

            {/* Desglose Financiero */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-text-secondary">Cliente</span>
                <span className="font-medium text-text-primary">{selectedTx.clienteNombre}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-text-secondary">Servicio</span>
                <span className="font-medium text-text-primary">{selectedTx.servicio}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-text-secondary">Sucursal</span>
                <span className="font-medium text-text-primary">{selectedTx.sucursal}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-text-secondary">Anticipo Pagado</span>
                <span className="font-mono font-medium text-success tabular-nums">
                  ${selectedTx.anticipoPagado.toFixed(2)} MXN
                </span>
              </div>
              {selectedTx.saldoPendiente > 0 && (
                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                  <span className="text-text-secondary">Saldo por liquidar en sede</span>
                  <span className="font-mono font-medium text-warning tabular-nums">
                    ${selectedTx.saldoPendiente.toFixed(2)} MXN
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 text-base font-bold">
                <span className="text-text-primary">Total del Servicio</span>
                <span className="font-mono text-grape tabular-nums">
                  ${selectedTx.montoTotal.toFixed(2)} MXN
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedTx(null)}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Imprimir recibo</span>
                <PendingBadge label="Pendiente" tooltip="Descarga de PDF en desarrollo" />
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
