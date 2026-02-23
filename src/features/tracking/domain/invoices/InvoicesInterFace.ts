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
  valor: number,
  descripcion: string,
  fecha_inicio: string,
  fecha_fin: string,
  fecha_creacion: string,
  eliminado: boolean,
  fecha_eliminacion: string,
  tipo_parametro: number,
}

export interface NoDeliveryProps {
  ruta: string;
  direccion: number;
  causal: string;
  documentMeico?: string;
  documentosArray?: string[];
  files?: string[];
}
