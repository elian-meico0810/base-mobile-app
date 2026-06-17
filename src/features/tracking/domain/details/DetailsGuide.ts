export interface Factura {
  numeroFactura: string;
  valorTotal: number;
  dfr: number;
  valorRecaudar: number;
  condPago: string;
  tipo: string;
  tipoCliente: string;
  numeroPedido?: string;
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
  razonSocial: string;
  latitud: string;
  longitud: string;
  estado: string;
  whatsapp?: string;
  CondPagoCliente?: string;
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

export interface ConciliationRouteResponse {
  valor_total: number;
  valor_recaudado: number;
  total_rechazado: number;
  recaudo_completo: boolean;
  concepto: {
    efectivo: number;
    qr_link: number;
    consignaciones: number;
    otros: number;
  };
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

export interface ResponseOTPInitTwoPorps {
  id?: number,
  direccion?: number,
  codigo?: string,
  momento_envio?: string,
  canal?: string,
  estado_envio?: string,
  numero_reenvio?: number,
  numero_validacion_conductor?: number,
  transportador?: string,
  expira_en?: string,
  ultimo_intento_verificacion?: string,
}

export interface ReentryOTPProps {
  idDireccion: number;
  numeroFactura: string;
  numeroDestino: string;
  valorOriginal: string;
  valorPagado: string;
}

export interface ValidateCodeOTPProps {
  idDireccion: number;
  codigoOtp: string;
}
export interface ValidateCediQRResponse {
  cedi: {
    id: number;
    nombre: string;
    codigo: string;
  };
  habilitarCuadreRuta: boolean;
}

export interface ListInfOTP {
  id: number;
  direccion: number;
  codigo: string;
  momento_envio: string;
  canal: string;
  estado_envio: string;
  numero_reenvio: number;
  numero_validacion_conductor: number;
  transportador: string;
  expira_en: string;
  ultimo_intento_verificacion: string;
}

export interface EvidencePhoto {
  id: string;
  uri: string;
  base64?: string;
}

export interface DataUploadFIlePprops {
  direccion_id: number;
  files: string[];
  numero_factura: string;
}

export interface ListAceptationGuide {
  id: number;
  codigo_guia: string;
  estado_aceptacion: boolean;
  fecha_aceptacion: string;
  fecha_rechazo: string;
}

export interface ReportePagoTotal {
  valorTotal: number;
}

export interface EvidenciaOTP {
  id: number;
  nombre: string;
  extension_archivo: string;
  url: string;
  fecha: string;
}

export interface EvidenciaOTPItemOTP {
  id: number;
  evidencia: EvidenciaOTP;
  direccion: number;
  eliminado: boolean;
}

export interface ReEntryDeliveryProps {
  id_pedido: number;
  reprogrmacion: string;
}

export interface OrderGroup {
  codigo: string;
  bodega: string;
  canal: string;
  cargue: string;
  codigo_cliente: string;
  codigo_guia: string;
  fecha_validacion: string;
  porcentaje_dfr: string;
  dfr: string;
  codigo_validado?: number| null| undefined;
  estado_pedido: StatusOrder;
  productos: ProductoPedido[];
}

export interface ProductoPedido {
  id: number;
  linea: number;
  producto: ProductoAceptacion;
  unidades_solicitadas: number;
  unidades_rechazadas: number;
  unidades_entregadas: number;
  total_entregado: string;
  total_impuesto_entrega: string;
  valor_base_producto: string;
  total_impuestos: string;
}


export interface AceptationOrderDetails {
  id: number;
  linea: number;
  aceptacion_pedido: AceptationOrder;
  producto: ProductoAceptacion;
  unidades_solicitadas: number;
  unidades_rechazadas: number;
  unidades_entregadas: number;
}

export interface AceptationOrder {
  id: number;
  codigo: string;
  bodega: string;
  canal: string;
  codigo_cliente: string;
  codigo_guia: string;
  fecha_validacion: string;
  estado_pedido: StatusOrder;
}


export interface StatusOrder {
  id: number;
  tipo: number;
  nombre: string;
  codigo: string;
}

export interface ProductoAceptacion {
  id: number;
  codigo: string;
  nombre: string;
  ean: string;
}
export interface Modulo {
  id: number;
  codigo: string;
  nombre: string;
  estado: boolean;
}

export interface ModuloVista {
  id: number;
  modulo: Modulo;
  nombre: string;
  tipo: string;
  estado: boolean;
}