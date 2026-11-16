import type { Transaccion } from "./pagos-types";

export const TRANSACCIONES_MOCK: Transaccion[] = [
  {
    id: "tx-1", txCode: "#TX-9481", fecha: "29 Sep 2026", hora: "14:30",
    clienteNombre: "Valeria Morales", clienteEmail: "valeria.m@gmail.com",
    servicio: "Corte & Estilo Personalizado", sucursal: "Sucursal Matriz Centro",
    montoTotal: 650, anticipoPagado: 650, saldoPendiente: 0,
    metodo: "stripe", estado: "pagado", stripeChargeId: "ch_3Pz7x82eZvKYlo2C1g9X810",
  },
  {
    id: "tx-2", txCode: "#TX-9480", fecha: "29 Sep 2026", hora: "12:15",
    clienteNombre: "Rodrigo Fernández", clienteEmail: "rodrigo.f@outlook.com",
    servicio: "Tratamiento Facial Purificante", sucursal: "Sucursal Providencia",
    montoTotal: 1200, anticipoPagado: 360, saldoPendiente: 840,
    metodo: "stripe", estado: "pendiente", stripeChargeId: "ch_3Pz7a12eZvKYlo2C0p1k942",
  },
  {
    id: "tx-3", txCode: "#TX-9479", fecha: "29 Sep 2026", hora: "10:00",
    clienteNombre: "Camila Torres", clienteEmail: "camila.torres@empresa.com",
    servicio: "Manicura Rusa & Gelish", sucursal: "Sucursal Matriz Centro",
    montoTotal: 450, anticipoPagado: 450, saldoPendiente: 0,
    metodo: "transferencia", estado: "pagado",
  },
  {
    id: "tx-4", txCode: "#TX-9478", fecha: "28 Sep 2026", hora: "18:45",
    clienteNombre: "Sebastián Alarcón", clienteEmail: "sebas.alarcon@live.com",
    servicio: "Masaje Descontracturante 60min", sucursal: "Sucursal Valle Oriente",
    montoTotal: 950, anticipoPagado: 950, saldoPendiente: 0,
    metodo: "stripe", estado: "reembolsado", stripeChargeId: "ch_3Pz6h92eZvKYlo2C2x88910",
  },
  {
    id: "tx-5", txCode: "#TX-9477", fecha: "28 Sep 2026", hora: "16:20",
    clienteNombre: "Mariana Delgado", clienteEmail: "marian.delgado@icloud.com",
    servicio: "Diseño y Perfilado de Cejas", sucursal: "Sucursal Providencia",
    montoTotal: 380, anticipoPagado: 380, saldoPendiente: 0,
    metodo: "stripe", estado: "pagado", stripeChargeId: "ch_3Pz5m42eZvKYlo2C1t74198",
  },
  {
    id: "tx-6", txCode: "#TX-9476", fecha: "28 Sep 2026", hora: "13:00",
    clienteNombre: "Alejandro Mendoza", clienteEmail: "alejandro.m@yahoo.com",
    servicio: "Corte Barba & Ritual Toalla Caliente", sucursal: "Sucursal Matriz Centro",
    montoTotal: 520, anticipoPagado: 156, saldoPendiente: 364,
    metodo: "stripe", estado: "pendiente", stripeChargeId: "ch_3Pz4k22eZvKYlo2C8y55421",
  },
  {
    id: "tx-7", txCode: "#TX-9475", fecha: "27 Sep 2026", hora: "17:15",
    clienteNombre: "Lucía Paredes", clienteEmail: "lucia.paredes@hotmail.com",
    servicio: "Limpieza Dental con Ultrasonido", sucursal: "Sucursal Valle Oriente",
    montoTotal: 1100, anticipoPagado: 1100, saldoPendiente: 0,
    metodo: "transferencia", estado: "pagado",
  },
  {
    id: "tx-8", txCode: "#TX-9474", fecha: "27 Sep 2026", hora: "11:30",
    clienteNombre: "Ignacio Vega", clienteEmail: "ignacio.vega@gmail.com",
    servicio: "Evaluación Nutricional Inicial", sucursal: "Sucursal Matriz Centro",
    montoTotal: 800, anticipoPagado: 0, saldoPendiente: 800,
    metodo: "efectivo", estado: "pendiente",
  },
  {
    id: "tx-9", txCode: "#TX-9473", fecha: "26 Sep 2026", hora: "15:40",
    clienteNombre: "Daniela Rivas", clienteEmail: "daniela.rivas@gmail.com",
    servicio: "Depilación Láser Diodo Facial", sucursal: "Sucursal Providencia",
    montoTotal: 750, anticipoPagado: 750, saldoPendiente: 0,
    metodo: "stripe", estado: "pagado", stripeChargeId: "ch_3Pz2a92eZvKYlo2C4r11094",
  },
  {
    id: "tx-10", txCode: "#TX-9472", fecha: "26 Sep 2026", hora: "09:30",
    clienteNombre: "Héctor Salgado", clienteEmail: "h.salgado@corporativo.mx",
    servicio: "Pedicura Clínica Especializada", sucursal: "Sucursal Valle Oriente",
    montoTotal: 600, anticipoPagado: 600, saldoPendiente: 0,
    metodo: "stripe", estado: "pagado", stripeChargeId: "ch_3Pz1y72eZvKYlo2C9w22187",
  },
];
