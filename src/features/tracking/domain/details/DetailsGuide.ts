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

export interface Document {
  id: number;
  codigo: string;
  bodega: string;
  fecha: string; // ISO date
  canal: string;
  codigoCliente: string;
  codigoGuia: string;
  dfr: string;
  detalles: Detail[];
}

export interface Detail {
  id: number;
  linea: number;
  producto: Product;
  imagenUrl?: string;
  valorBaseProducto: string;
  totalImpuestos: string;
  estado: Status;
  unidadesSolicitadas: number;
  unidadesRechazadas: number;
  unidadesEntregadas: number;
  totalEntregado: string;
  totalImpuestoEntrega: string;
  novedades: Novelty[];
}

export interface Product {
  id: number;
  codigo: string;
  nombre: string;
}

export interface Status {
  tipo: number;
  nombre: string;
  codigo: string;
}

export interface Novelty {
  id: number;
  causal: Cause;
  valor: string;
}

export interface Cause {
  codigo: string;
  nombre: string;
  requiereEvidencia: boolean;
}
