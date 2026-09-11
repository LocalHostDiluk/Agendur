import { Store, MapPin, Phone, Users, Plus } from "lucide-react";

export default function SucursalesPage() {
  const sucursales = [
    {
      id: "suc-1",
      nombre: "Sucursal Central - Polanco",
      ciudad: "CDMX",
      direccion: "Av. Horacio 450, Polanco III Secc",
      telefono: "+52 55 4160 0001",
      personal: 6,
      citasMes: 142,
      activa: true,
    },
    {
      id: "suc-2",
      nombre: "Sucursal Roma Norte",
      ciudad: "CDMX",
      direccion: "Colima 180, Roma Norte",
      telefono: "+52 55 4160 0002",
      personal: 4,
      citasMes: 98,
      activa: true,
    },
    {
      id: "suc-3",
      nombre: "Sucursal Guadalajara",
      ciudad: "Guadalajara",
      direccion: "Av. Vallarta 1200, Americana",
      telefono: "+52 33 3810 0003",
      personal: 5,
      citasMes: 115,
      activa: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Gestión de Sucursales
          </h1>
          <p className="text-sm text-slate-400">
            Agrega y administra las direcciones y personal de cada ubicación de
            tu empresa.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-500/20">
          <Plus className="w-4 h-4" /> Agregar Nueva Sucursal
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {sucursales.map((suc) => (
          <div
            key={suc.id}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Store className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVA
              </span>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">{suc.nombre}</h3>
              <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                {suc.direccion} ({suc.ciudad})
              </p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> {suc.telefono}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" /> {suc.personal}{" "}
                Profesionales
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {suc.citasMes} citas/mes
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
