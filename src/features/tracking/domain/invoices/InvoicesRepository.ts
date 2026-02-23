import { ApiResponse } from "@/src/features/auth/domain/ApiResponse";
import { CreateEntregaProps, CreatePaymentTypeProps, DerliveryDocument, GenerateQRPorps, NoDeliveryProps, OpneAddressesDeliveryProps, OpneAddressesProps, PaymentGatewayProps, ReportWhatsAppQRPorps, successOrderCashPayment, successOrderPayment, TypeParameterValue, WhatsappProps, WhatsappTATImageProps } from "./InvoicesInterFace";

export interface InvoicesRepository {
  sendPaymentGetway: (data: PaymentGatewayProps, token: string) => Promise<any>;
  generateQR: (data: GenerateQRPorps, token: string) => Promise<any>;
  reportWhatsApp: (data: ReportWhatsAppQRPorps, token: string) => Promise<any>;
  successfulBillPayment: (numeroFactura: number, token: string, pedidoId: number) => Promise<any>;
  openAddresses: (data: OpneAddressesProps, addresseId: number, token: string) => Promise<any>;
  closeAddresses: (guide: number, token: string) => Promise<any>;
  createDelivery: (data: CreateEntregaProps, token: string) => Promise<any>;
  whatsappProps: (data: WhatsappProps, APIKey: string) => Promise<any>;
  listDocument: ( numeroFactura: string | null, idDireccion: number, token: string) => Promise<ApiResponse<DerliveryDocument>>;
  OpneAddressesDelivery: (data: OpneAddressesDeliveryProps, addresseId: number, token: string) => Promise<any>;
  WhatsappTATImage: (data: WhatsappTATImageProps, APIKey: string) => Promise<any>;
  createPaymentType: (data: CreatePaymentTypeProps[], token: string) => Promise<any>;
  successOrderPayment: (idPedido: number, token: string)  => Promise<ApiResponse<successOrderPayment>>;
  successTypeCashPayment: (guide: string, token: string)  => Promise<ApiResponse<successOrderCashPayment>>;
  typeParameterValue: (type_paramter: string, token: string)  => Promise<ApiResponse<TypeParameterValue>>;
  registerNoDelivery: (data: NoDeliveryProps, token: string) => Promise<any>;

}
