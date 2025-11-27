export interface Factura {
  numeroFactura: string;
  valorTotal: number;
  dfr: number;
  valorRecaudar: number;
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

export interface PaymentGatewayProps {
  documento: {
    numero: string;
    codigoCliente: string;
    tipoDocumento: string;
  };
  linkFisico: boolean;
  linkVirtual: boolean;
}

export interface GenerateQRPorps {
  numdoc: string,
  tipodoc: string,
  cus_no: string,
}

export interface ReportWhatsAppQRPorps {
  whatsapp: string,
  nombre_cliente: string,
  link_pago: string,
}

export interface Payment {
    id: number;
    numeroDeposito: string;
    fechaDeposito: string;
    valorPagado: string;
    canal: string;
    numeroDocumento: string;
    estado: string;
    referencia: string;
}

export interface Invoice {
    numeroFactura: number;
    nombreEstablecimiento: string;
    totalFactura: number;
    saldoPendiente: number;
    numeroContacto: string;
    pagos: Payment[];
}