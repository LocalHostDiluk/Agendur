"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useCatalogo } from "@/lib/hooks/use-catalogo";
import { useDisponibilidad } from "@/lib/hooks/use-disponibilidad";
import { useCrearReserva } from "@/lib/hooks/use-reserva";
import { ApiClientError } from "@/lib/query/api-client";
import type { Cita } from "@/lib/types";

export function BookingPortal({ negocioSlug }: { negocioSlug: string }) {
  const catalogo = useCatalogo(negocioSlug);
  const reserva = useCrearReserva();
  const [sucursalId, setSucursalId] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [profesionalId, setProfesionalId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [notas, setNotas] = useState("");
  const [privacidad, setPrivacidad] = useState(false);
  const [cancelacion, setCancelacion] = useState(false);
  const [error, setError] = useState("");
  const [cita, setCita] = useState<Cita | null>(null);

  const data = catalogo.data?.data;
  const negocio = data?.negocio;
  const sucursal = data?.sucursales.find((item) => item.id === sucursalId);
  const servicio = data?.servicios.find((item) => item.id === servicioId);
  const profesionales = data?.profesionales.filter(
    (item) => item.sucursal_id === sucursal?.id && item.serviciosIds.includes(servicio?.id ?? ""),
  ) ?? [];
  const profesional = profesionales.find((item) => item.id === profesionalId);
  const disponibilidad = useDisponibilidad({
    sucursalId: sucursal?.id,
    servicioId: servicio?.id,
    profesionalId: profesional?.id,
    fecha: fecha || undefined,
  });
  const horarios = disponibilidad.data?.horarios ?? [];
  const horaDisponible = horarios.includes(hora) ? hora : "";

  async function handleBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!negocio || !sucursal || !servicio || !profesional || !fecha || !horaDisponible) {
      setError("Selecciona una sucursal, servicio, profesional, fecha y horario disponible.");
      return;
    }
    try {
      const result = await reserva.mutateAsync({
        sucursalId: sucursal.id,
        servicioId: servicio.id,
        profesionalId: profesional.id,
        fecha,
        hora: horaDisponible,
        clienteNombre: nombre.trim(),
        clienteApellido: apellido.trim(),
        clientePhone: telefono.trim() || null,
        clienteEmail: email.trim() || null,
        notasCliente: negocio.notas_cliente_habilitadas ? notas.trim() : undefined,
        aceptaPrivacidad: privacidad,
        aceptaPoliticaCancelacion: cancelacion,
      });
      setCita(result.cita);
    } catch (cause) {
      if (cause instanceof ApiClientError && cause.status === 409) {
        setHora("");
        await disponibilidad.refetch();
        setError("Ese horario ya no está disponible. Elige uno de los horarios actualizados.");
      } else {
        setError(cause instanceof Error ? cause.message : "No se pudo completar la reserva.");
      }
    }
  }

  if (catalogo.isPending) return <p>Cargando catálogo…</p>;
  if (catalogo.isError) return <p role="alert">No se pudo cargar el catálogo. <button type="button" onClick={() => catalogo.refetch()}>Reintentar</button></p>;
  if (!negocio) return <p role="alert">Negocio no encontrado.</p>;

  if (cita) return (
    <section>
      <h1>Reserva registrada</h1>
      <p>{negocio.nombre_comercial}: {cita.fecha} a las {cita.hora_inicio?.slice(0, 5)}.</p>
      <button type="button" onClick={() => {
        setCita(null);
        setHora("");
        setPrivacidad(false);
        setCancelacion(false);
        reserva.reset();
      }}>Agendar otra cita</button>
    </section>
  );

  return (
    <section>
      <p><Link href="/">Volver al inicio</Link></p>
      <h1>Reservar en {negocio.nombre_comercial}</h1>
      {data?.sucursales.length === 0 ? <p>No hay sucursales disponibles.</p> : null}
      <form onSubmit={handleBooking}>
        <fieldset>
          <legend>Tu cita</legend>
          <label htmlFor="reserva-sucursal">Sucursal</label>
          <select id="reserva-sucursal" value={sucursal?.id ?? ""} required onChange={(event) => {
            setSucursalId(event.target.value);
            setServicioId("");
            setProfesionalId("");
            setFecha("");
            setHora("");
          }}>
            <option value="">Selecciona una sucursal</option>
            {data?.sucursales.map((item) => <option key={item.id} value={item.id}>{item.nombre} — {item.direccion}</option>)}
          </select>
          <label htmlFor="reserva-servicio">Servicio</label>
          <select id="reserva-servicio" value={servicio?.id ?? ""} required disabled={!sucursal} onChange={(event) => {
            setServicioId(event.target.value);
            setProfesionalId("");
            setFecha("");
            setHora("");
          }}>
            <option value="">Selecciona un servicio</option>
            {data?.servicios.map((item) => <option key={item.id} value={item.id}>{item.nombre} — {item.duracion_minutos} min — {item.precio} {negocio.moneda_principal}</option>)}
          </select>
          <label htmlFor="reserva-profesional">Profesional</label>
          <select id="reserva-profesional" value={profesional?.id ?? ""} required disabled={!servicio} onChange={(event) => {
            setProfesionalId(event.target.value);
            setHora("");
          }}>
            <option value="">Selecciona un profesional</option>
            {profesionales.map((item) => <option key={item.id} value={item.id}>{item.nombre} {item.apellido}</option>)}
          </select>
          {servicio && profesionales.length === 0 ? <p>No hay profesionales disponibles para este servicio en esta sucursal.</p> : null}
          <label htmlFor="reserva-fecha">Fecha</label>
          <input id="reserva-fecha" type="date" value={fecha} required disabled={!profesional} onChange={(event) => {
            setFecha(event.target.value);
            setHora("");
          }} />
          <label htmlFor="reserva-hora">Horario</label>
          <select id="reserva-hora" value={horaDisponible} required disabled={!fecha || !profesional || disponibilidad.isFetching || disponibilidad.isError} onChange={(event) => setHora(event.target.value)}>
            <option value="">Selecciona un horario</option>
            {horarios.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          {disponibilidad.isFetching ? <p>Consultando horarios…</p> : null}
          {disponibilidad.isError ? <p role="alert">No se pudieron consultar los horarios. <button type="button" onClick={() => disponibilidad.refetch()}>Reintentar</button></p> : null}
          {fecha && !disponibilidad.isFetching && !disponibilidad.isError && horarios.length === 0 ? <p>No hay horarios disponibles para esa fecha.</p> : null}
        </fieldset>
        <fieldset>
          <legend>Tus datos</legend>
          <label htmlFor="reserva-nombre">Nombre</label>
          <input id="reserva-nombre" value={nombre} required maxLength={100} onChange={(event) => setNombre(event.target.value)} />
          <label htmlFor="reserva-apellido">Apellidos</label>
          <input id="reserva-apellido" value={apellido} required maxLength={100} onChange={(event) => setApellido(event.target.value)} />
          <label htmlFor="reserva-telefono">Teléfono{negocio.telefono_cliente_requerido ? " (obligatorio)" : " (opcional)"}</label>
          <input id="reserva-telefono" type="tel" value={telefono} required={negocio.telefono_cliente_requerido} pattern="\+?[1-9][0-9]{7,14}" title="Usa 8 a 15 dígitos en formato internacional, sin espacios" onChange={(event) => setTelefono(event.target.value)} />
          <label htmlFor="reserva-email">Correo electrónico{negocio.email_cliente_requerido ? " (obligatorio)" : " (opcional)"}</label>
          <input id="reserva-email" type="email" value={email} required={negocio.email_cliente_requerido} maxLength={254} onChange={(event) => setEmail(event.target.value)} />
          {negocio.notas_cliente_habilitadas ? <><label htmlFor="reserva-notas">Notas (opcional)</label><textarea id="reserva-notas" value={notas} maxLength={2000} onChange={(event) => setNotas(event.target.value)} /></> : null}
        </fieldset>
        <fieldset>
          <legend>Consentimientos</legend>
          <label><input type="checkbox" checked={privacidad} required onChange={(event) => setPrivacidad(event.target.checked)} /> Acepto el <Link href="/privacidad" target="_blank">aviso de privacidad</Link>.</label>
          {negocio.politica_cancelacion?.trim() ? <>
            <p>Política de cancelación: {negocio.politica_cancelacion}</p>
            <label><input type="checkbox" checked={cancelacion} required onChange={(event) => setCancelacion(event.target.checked)} /> Acepto la política de cancelación.</label>
          </> : null}
        </fieldset>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit" disabled={reserva.isPending || !horaDisponible || disponibilidad.isFetching}>{reserva.isPending ? "Registrando…" : "Confirmar reserva"}</button>
      </form>
    </section>
  );
}
