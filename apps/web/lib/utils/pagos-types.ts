export interface Transaccion {
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

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
