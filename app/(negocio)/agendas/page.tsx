import { Calendar as CalendarIcon, Clock, Filter, Plus } from "lucide-react";

export default function AgendasPage() {
  const citas = [
    {
      id: "1",
      fecha: "2026-09-08",
      hora: "10:00 hrs",
      cliente: "Juan Pérez",
      servicio: "Corte & Estilo Barbería",
      especialista: "Carlos Méndez",
      sucursal: "Sucursal Polanco",
      estado: "Confirmada",
    },
    {
      id: "2",
      fecha: "2026-09-08",
      hora: "12:15 hrs",
      cliente: "Ana Sofía Gómez",
      servicio: "Tratamiento Facial Spa",
      especialista: "Dra. Elena Gómez",
      sucursal: "Sucursal Roma Norte",
      estado: "Confirmada",
    },
    {
      id: "3",
      fecha: "2026-09-08",
      hora: "16:30 hrs",
      cliente: "Carlos Mendoza",
      servicio: "Consulta Especializada",
      especialista: "Roberto Silva",
      sucursal: "Sucursal Polanco",
      estado: "Pendiente WhatsApp",
    },
    {
      id: "4",
      fecha: "2026-09-09",
      hora: "11:00 hrs",
      cliente: "Mariana Torres",
      servicio: "Corte & Estilo Barbería",
      especialista: "Carlos Méndez",
      sucursal: "Sucursal Guadalajara",
      estado: "Confirmada",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Agendas & Citas Programadas
          </h1>
          <p className="text-sm text-slate-400">
            Visualiza las citas agendadas por tus clientes por sucursal y
            especialista.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white">
            <Filter className="w-4 h-4" />
          </button>
          <button className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl">
            <Plus className="w-4 h-4" /> Agendar Cita Manual
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-emerald-400" /> Citas de la
            Semana
          </span>
          <span className="font-mono text-emerald-400">
            4 Citas Registradas
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {citas.map((c) => (
            <div
              key={c.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    {c.cliente}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    {c.sucursal}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {c.servicio} con{" "}
                  <span className="text-slate-200">{c.especialista}</span>
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                <div className="text-right">
                  <span className="font-mono text-emerald-400 font-bold block">
                    {c.hora}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {c.fecha}
                  </span>
                </div>

                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {c.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
