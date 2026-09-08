import { Store, Calendar, TrendingUp, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    {
      name: "Citas Confirmadas Hoy",
      value: "18",
      change: "+12%",
      icon: Calendar,
    },
    { name: "Sucursales Operativas", value: "3", change: "100%", icon: Store },
    {
      name: "Ingresos Estimados (Mes)",
      value: "$12,450 USD",
      change: "+24%",
      icon: TrendingUp,
    },
    { name: "Clientes Recurrentes", value: "342", change: "+8%", icon: Users },
  ];

  const recentBookings = [
    {
      id: "1",
      cliente: "Juan Pérez",
      sucursal: "Sucursal Polanco",
      servicio: "Corte & Estilo Premium",
      hora: "10:00 hrs",
      estado: "Confirmada",
    },
    {
      id: "2",
      cliente: "Ana Sofía Gómez",
      sucursal: "Sucursal Roma Norte",
      servicio: "Tratamiento Facial Spa",
      hora: "12:15 hrs",
      estado: "Confirmada",
    },
    {
      id: "3",
      cliente: "Carlos Mendoza",
      sucursal: "Sucursal Polanco",
      servicio: "Consulta Especializada",
      hora: "16:30 hrs",
      estado: "Pendiente WhatsApp",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Panel General de la Empresa
        </h1>
        <p className="text-sm text-slate-400">
          Resumen operativo de tus sucursales y reservaciones en tiempo real.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {stat.name}
              </span>
              <stat.icon className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white font-mono">
                {stat.value}
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-white">
            Últimas Citas Agendadas por Clientes
          </h2>
          <Link
            href="/agendas"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Sucursal</th>
                <th className="py-3 px-4">Servicio</th>
                <th className="py-3 px-4">Horario</th>
                <th className="py-3 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-white">
                    {b.cliente}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{b.sucursal}</td>
                  <td className="py-3 px-4">{b.servicio}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400">
                    {b.hora}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {b.estado}
                    </span>
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
