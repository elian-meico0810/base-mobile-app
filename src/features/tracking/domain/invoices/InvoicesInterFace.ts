export interface RuteInitPorps {
  codigoGuia: string;
  latitud: string;
  longitud: string;
  fechaHoraDispositivo: string
}

export interface PaymentGatewayProps {
  documento: {
    numero: string;
    nombreCliente?: string;
    codigoCliente: string;
    tipoDocumento: string;
    valor?: number;
  };
  linkFisico: boolean;
  linkVirtual: boolean;
}

export interface GenerateQRPorps {
  numdoc: string;
  tipodoc: string;
  cus_no: string;
  tipoCliente: string;
}

export interface ReportWhatsAppQRPorps {
  whatsapp: string;
  nombre_cliente: string;
  link_pago: string;
}

export interface Payment {
  id?: number | null  | undefined;
  numeroDeposito?: string | null  | undefined;
  fechaDeposito?: string | null  | undefined;
  valorPagado?: string | null  | undefined;
  canal?: string | null  | undefined;
  numeroDocumento?: string | null  | undefined;
  estado?: string | null  | undefined;
  referencia?: string | null  | undefined;
  descripcion?: string | null  | undefined;
}

export interface Invoice {
  numeroFactura?: number | null  | undefined;
  nombreEstablecimiento?: string | null  | undefined;
  totalFactura?: number | null  | undefined;
  saldoPendiente?: number | null  | undefined;
  numeroContacto?: string | null  | undefined;
  pagos: Payment[];
}

export interface OpneAddressesProps {
  latitud: string;
  longitud: string;
  fechaHoraDispositivo: string;
}

export interface CreateEntregaProps {
  ruta: string;
  documentMeico?: string;
  documentosArray?: string[];
  direccion: number;
  causal?: string | null;
  estado: string;
  files: EvidenceFile[];
}

export interface EvidenceFile {
  tipoEntrega: string | null;
  rutaArchivo: string | null;
}

export interface WhatsappProps {
  whatsapp: string;
  nombre_cliente: string;
  link_pago: string
}

export interface TypeDetails {
  tipo: number;
  nombre: string;
  codigo: string;
}

export interface DerliveryDocument {
  id: number;
  ruta: number;
  documentMeico: string;
  direccion: number;
  momentoCreacion: string;
  tipoEntrega: TypeDetails;
  causal: number | null;
  estado: number;
}

export interface OpneAddressesDeliveryProps {
  latitud: string;
  longitud: string;
  fechaHoraDispositivo: string;
  es_entregado: boolean;
}

export interface WhatsappTATImageProps {
  cus_no: string,
  numdoc: string,
  tipodoc: string,
  tipoCliente: string,
  cliente: string,
  numeroWhatsapp: string,
}

export interface CreatePaymentTypeProps {
  usuario: string,
  momento: string,
  valorRegistrado: number,
  tipoPago: string,
  descripcion: string,
  pedidos: string[],
}

export interface successOrderPayment {
  reporteId: number,
  usuario: string,
  momento: string,
  valorRegistrado: number,
  tipoPago: string,
  descripcion: string,
}

export interface successOrderCashPayment {
  codigoGuia: string;
  totalEfectivo: number;
  pagos: successOrderPayment[];
}

export interface TypeParameterValue {
  id: number,
  valor: string,
  descripcion: string,
  fecha_inicio: string,
  fecha_fin: string,
  fecha_creacion: string,
  eliminado: boolean,
  fecha_eliminacion: string,
  tipo_parametro: number,
}

export interface SuccessOrderArrayPayment {
  valorRegistrado: number,
}

export interface NoDeliveryProps {
  ruta: string;
  direccion: number;
  causal: string;
  documentMeico?: string;
  documentosArray?: string[];
  files?: string[];
}


export interface GuideResponse {
  details: CustomerAddress[];
}

export interface CustomerAddress {
  idDireccion: number;
  direccion: string;
  poblacion: string;
  codigoCliente: string;
  nombreCliente: string;
  latitud: string;
  longitud: string;
  estado: string;
  fecha_apertura: string | null;
  whatsapp: string;
  CondPagoCliente: string;
  facturas: InvoiceDetail[];
  pedidos: Order[];
}

export interface InvoiceDetail {
  idGuia: number;
  numeroFactura: string;
  valorTotal: number;
  dfr: number;
  valorRecaudar: number;
  tipo: string;
  condPago: string;
  tipoCliente: string;
  bodega: string;
  fechaPedido: string;
  numeroPedido: string;
  porcentajeDFR: number;
}

export interface Order {
  id: number;
  codigo: string;
  bodega: string;
  fecha: string;
  canal: string;
  codigoCliente: string;
  codigoGuia: string;
  dfr: number;
  porcentajeDFR: number;
  detalles: OrderDetail[];
}

export interface OrderDetail {
  id: number;
  linea: number;
  producto: Product;
  valorBaseProducto: string;
  totalImpuestos: string;
  unidadesSolicitadas: number;
  unidadesRechazadas: number;
  unidadesEntregadas: number;
  totalEntregado: string;
  totalImpuestoEntrega: string;
}

export interface Product {
  id: number;
  codigo: string;
  nombre: string;
}

export interface ApproveOrReject {
  guia_id: number;
  is_acceptation: boolean;
}


export interface UploadEvidenceAcceptationGuidesProps {
  codigo_guia: string;
  files: string[];
}
