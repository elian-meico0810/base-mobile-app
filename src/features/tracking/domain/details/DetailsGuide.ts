export interface Factura {
  numeroFactura: string;
  valorTotal: number;
  dfr: number;
  valorRecaudar: number;
  condPago: string;
  tipo: string;
  tipoCliente: string;
}

export interface GuideDetails {
  idDireccion: number;
  direccion: string;
  poblacion: string;
  codigoCliente: string;
  nombreCliente: string;
  latitud: string;
  longitud: string;
  estado: string;
  whatsapp?: string;
  facturas: Factura[];
}

export interface RuteInitPorps {
  codigoGuia: string,
  latitud: string,
  longitud: string,
  fechaHoraDispositivo: string
}

export interface RuteByCodeGuide {
  id: string,
  codigo_guia: number,
  estado_id: number,
  fecha_inicio: string,
  fecha_finalizacion: string
}

export interface PaymentsByInvoicePorps {
  id_guia: string;
}


export interface PaymentsByInvoice {
  total_pagado: number,
  total_pendiente: number,
  total_rechazado: number,
  total_facturas: number,
  facturas_entregables: number,
  puede_entregar_todo: boolean,
}