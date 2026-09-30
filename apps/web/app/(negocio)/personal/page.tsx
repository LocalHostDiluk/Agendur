"use client";

import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthMe } from "@/lib/hooks/use-auth-me";
import { useSucursales, useServicios } from "@/lib/hooks/use-negocio-data";
import { apiFetch } from "@/lib/query/api-client";
import { notify } from "@/lib/utils/toast";
import type { Profesional } from "@/lib/types";

export interface UnifiedColaborador extends Profesional { serviciosIds: string[]; rol?: string; hora_inicio?: string; hora_fin?: string; dias_laborables?: number[] }
type Member = {
  id: string; kind: "collaborator" | "professional"; nombre: string; apellido: string;
  email: string; rol: "manager" | "receptionist" | "professional"; sucursalId: string | null;
  usuarioId: string | null; activo: boolean; servicioIds: string[];
  horarios?: { dia_semana: number; hora_inicio: string; hora_fin: string }[];
};
const labels = { manager: "Gerente", receptionist: "Recepcionista", professional: "Profesional" };
const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const control = "max-w-full min-w-0 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-grape";
const primaryButton = "rounded-md bg-grape px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-grape";

export default function PersonalPage({ initialTab = "directorio" }: { initialTab?: "directorio" | "horarios" } = {}) {
  const { data: auth } = useAuthMe();
  const canRead = auth?.access?.capabilities.includes("staff:read") ?? false;
  const canWrite = auth?.access?.capabilities.includes("staff:write") ?? false;
  const [tab, setTab] = useState(initialTab);
  const [adding, setAdding] = useState(false);
  const [role, setRole] = useState<Member["rol"]>("professional");
  const [branch, setBranch] = useState("");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { data: branchData } = useSucursales();
  const { data: serviceData } = useServicios();
  const personal = useQuery({
    queryKey: ["negocio", "personal"], enabled: canRead,
    queryFn: () => apiFetch<{ personal: Member[] }>("/api/negocio/personal"),
  });
  const mutation = useMutation({
    mutationFn: ({ method, payload }: { method: "POST" | "PATCH"; payload: Record<string, unknown> }) =>
      apiFetch("/api/negocio/personal", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["negocio"] }); setAdding(false); notify.success("Personal actualizado"); },
    onError: error => notify.error(error, "No se pudo guardar el personal"),
  });
  const members = (personal.data?.personal ?? []).filter(p =>
    (branch === "" || p.sucursalId === branch) && `${p.nombre} ${p.apellido} ${p.email}`.toLowerCase().includes(search.toLowerCase()));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    await mutation.mutateAsync({ method: "POST", payload: {
      rol: role, nombre: fields.get("nombre"), apellido: fields.get("apellido"), email: fields.get("email"),
      telefono: fields.get("telefono"), sucursalId: fields.get("sucursalId"), servicioIds: fields.getAll("servicioIds"),
    } }).catch(() => {});
  }
  if (auth && !canRead) return <p>No tienes permiso para consultar el directorio.</p>;
  return <div className="space-y-6 max-w-6xl mx-auto">
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="font-bricolage text-3xl">Equipo &amp; Personal</h1><p className="text-text-secondary">Gestiona los especialistas y colaboradores de tu negocio</p></div>
      {canWrite && <button className={`${primaryButton} shrink-0`} onClick={() => setAdding(!adding)}>Registrar Colaborador</button>}</header>
    <div role="group" aria-label="Vistas de personal" className="flex gap-4">
      <button className={tab === "directorio" ? "text-grape font-semibold" : "text-text-secondary"} aria-pressed={tab === "directorio"} onClick={() => setTab("directorio")}>Directorio del Equipo</button>
      <button className={tab === "horarios" ? "text-grape font-semibold" : "text-text-secondary"} aria-pressed={tab === "horarios"} onClick={() => setTab("horarios")}>Horarios</button>
    </div>
    <div className="flex flex-col sm:flex-row gap-4"><input aria-label="Buscar personal" placeholder="Buscar personal" value={search} onChange={e => setSearch(e.target.value)} className={`${control} flex-1`} />
      <select aria-label="Filtrar sucursal" value={branch} onChange={e => setBranch(e.target.value)} className={`${control} flex-1`}><option value="">Todas las sucursales</option>{branchData?.sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></div>
    {personal.isLoading && <p data-testid="personal-loading" className="animate-pulse">Cargando personal…</p>}
    {personal.isError && <div role="alert">No se pudo consultar el personal. <button onClick={() => personal.refetch()}>Reintentar</button></div>}
    {personal.data && members.length === 0 && <p>Aún no tienes personal registrado</p>}
    <div className="grid gap-4">{members.map(p => <article key={p.id} className="rounded-xl border border-border bg-surface p-4 space-y-2 break-words min-w-0">
      <h2 className="font-semibold">{p.nombre || p.email} {p.apellido}</h2><p>{labels[p.rol]} · {p.activo ? "Activo" : "Inactivo"}</p>
      <p>{branchData?.sucursales.find(s => s.id === p.sucursalId)?.nombre ?? "Todas las sucursales"}</p>
      {tab === "horarios" ? <p>{p.horarios?.length ? p.horarios.map(h => `${days[h.dia_semana]} ${h.hora_inicio.slice(0, 5)}–${h.hora_fin.slice(0, 5)}`).join(" · ") : "Sin horarios registrados"}</p> : <>
        <p>{p.email}</p><p>{p.servicioIds.map(id => serviceData?.servicios.find(s => s.id === id)?.nombre).filter(Boolean).join(", ")}</p>
        {p.kind === "professional" && <p>{p.usuarioId ? "Acceso vinculado" : "Sin cuenta de acceso vinculada"}</p>}
      </>}
      {canWrite && <div className="flex flex-wrap gap-3">
        <button disabled={mutation.isPending} aria-label={`${p.activo ? "Desactivar" : "Activar"} a ${p.nombre || p.email}`} onClick={() => mutation.mutate({ method: "PATCH", payload: { id: p.id, kind: p.kind, activo: !p.activo } })}>{p.activo ? "Desactivar" : "Activar"}</button>
        {p.kind === "collaborator" && <select aria-label={`Rol de ${p.email}`} value={p.rol} disabled={mutation.isPending} onChange={e => {
          const rol = e.target.value;
          const sucursalId = p.sucursalId ?? branchData?.sucursales[0]?.id;
          if (rol === "receptionist" && !sucursalId) return notify.error("Primero registra una sucursal");
          mutation.mutate({ method: "PATCH", payload: { id: p.id, kind: p.kind, rol, sucursalId } });
        }}><option value="manager">Gerente</option><option value="receptionist">Recepcionista</option></select>}
        {p.rol !== "manager" && <select aria-label={`Sucursal de ${p.email}`} value={p.sucursalId ?? ""} disabled={mutation.isPending} onChange={e => mutation.mutate({ method: "PATCH", payload: { id: p.id, kind: p.kind, sucursalId: e.target.value } })}>{branchData?.sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select>}
        {p.kind === "professional" && !p.usuarioId && <button onClick={() => mutation.mutate({ method: "PATCH", payload: { id: p.id, kind: p.kind, usuarioEmail: p.email } })}>Vincular cuenta registrada</button>}
      </div>}
    </article>)}</div>
    {adding && canWrite && <form onSubmit={submit} className="rounded-xl border p-4 space-y-3" aria-label="Registrar colaborador">
      <p>Gerentes y recepcionistas deben tener una cuenta registrada. Podrán elegir este negocio al iniciar sesión.</p>
      <label className="block">Rol <select aria-label="Rol del colaborador" value={role} onChange={e => setRole(e.target.value as Member["rol"])} className={`${control} block mt-1 w-full`}>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label className="block">Correo <input name="email" type="email" required maxLength={254} className={`${control} block mt-1 w-full`} /></label>
      {role !== "manager" && <label className="block">Sucursal <select name="sucursalId" required className={`${control} block mt-1 w-full`}><option value="">Seleccionar</option>{branchData?.sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></label>}
      {role === "professional" && <>
        <label className="block">Nombre <input name="nombre" required maxLength={120} className={`${control} block mt-1 w-full`} /></label>
        <label className="block">Apellido <input name="apellido" required maxLength={120} className={`${control} block mt-1 w-full`} /></label>
        <label className="block">Teléfono <input name="telefono" type="tel" maxLength={20} className={`${control} block mt-1 w-full`} /></label>
        <fieldset><legend>Servicios</legend>{serviceData?.servicios.map(s => <label key={s.id} className="block"><input name="servicioIds" type="checkbox" value={s.id} /> {s.nombre}</label>)}</fieldset>
      </>}
      <div className="flex flex-wrap gap-3"><button className={primaryButton} type="submit" disabled={mutation.isPending}>Guardar colaborador</button><button className="rounded-md border border-border px-4 py-2 text-sm" type="button" onClick={() => setAdding(false)}>Cancelar</button></div>
    </form>}
  </div>;
}
