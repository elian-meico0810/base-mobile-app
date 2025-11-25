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

export interface PaymentGetwayPorps {
  documento: string,
  linkFisico: string,
  linkVirtual: string,
}

export interface GenerateQRPorps {
  numdoc: string,
  tipodoc: string,
  cus_no: string,
}