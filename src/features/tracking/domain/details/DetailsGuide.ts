export interface Factura {
  numeroFactura: string;
  valorTotal: number;
  dfr: number;
  valorRecaudar: number;
  condPago: string;
  tipo: string;
  tipoCliente: string;
}

export interface Pedidos {
  id: number;
  codigo: string;
  bodega: string;
  fecha: string;
  canal: string;
  codigoCliente: string;
  codigoGuia: string;
  dfr: number;
  porcentajeDFR: number;
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
  fecha_apertura?: string | null;
  facturas: Factura[];
  pedidos?: Pedidos[];
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

export interface ConditionPago {
  id: number;
  nombre: string;
  codigo: string;
}

export interface Document {
  id: number;
  codigo: string;
  bodega: string;
  fecha: string;
  canal: string;
  codigoCliente: string;
  codigoGuia: string;
  dfr: string;
  porcentajeDFR: string;
  condicionPago: ConditionPago;
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

export interface TokenProducts {
  base_url: string;
  token: string;
}

export interface SendOrderProps {
  totalEntregado: string;
  totalImpuestoEntrega: string;
}

export interface NoveltyRefusedProps {
  pedidoDetalleId: number;
  novedades: causalValuePorps[];
  unidadesRechazadas: number;
  unidadesEntregadas: number;
  totalEntregado: number;
  totalImpuestoEntrega: number;
}

export interface causalValuePorps {
  causalCodigo: string;
  valor: string;
}
export interface SendOrderArrayProps {
  totalEntregado: string;
  totalImpuestoEntrega: string;
  idPedidoDetalle: number;
}

export interface ReportNoveltyFileArrayProps {
  id_pedido: number;
  files: string[];
}

export interface NovletyOrder {
  id: number;
  id_pedido: number;
  ruta_novedad: string;
  momento_reporte: string;
}


export interface SendOTOPProps {
  idDireccion: number;
  numeroFactura: string;
  numeroDestino: string;
  valorOriginal: string;
  valorPagado: string;
}

export interface ResponseOTPInitPorps {
  id?: number,
  direccionId?: number,
  momentoEnvio?: string,
  numeroDestino?: string,
  canal?: string,
  estadoEnvioId?: number,
  numeroReenvio?: number,
  numeroValidacionConductor?: number,
  transportador?: string,
  expiraEn?: string,
  ultimoIntentoVerificacion?: string,
}

export interface ReentryOTPProps {
  idDireccion: number;
  numeroFactura: string;
  numeroDestino: string;
  valorOriginal: string;
  valorPagado: string;
}
