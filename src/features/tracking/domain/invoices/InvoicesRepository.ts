import { ApiResponse } from "@/src/features/auth/domain/ApiResponse";
import { CreateEntregaProps, DerliveryDocument, GenerateQRPorps, OpneAddressesDeliveryProps, OpneAddressesProps, PaymentGatewayProps, ReportWhatsAppQRPorps, WhatsappProps, WhatsappTATImageProps } from "./InvoicesInterFace";

export interface InvoicesRepository {
  sendPaymentGetway: (data: PaymentGatewayProps, token: string) => Promise<any>;
  generateQR: (data: GenerateQRPorps, token: string) => Promise<any>;
  reportWhatsApp: (data: ReportWhatsAppQRPorps, token: string) => Promise<any>;
  successfulBillPayment: (guide: number, token: string) => Promise<any>;
  openAddresses: (data: OpneAddressesProps, addresseId: number, token: string) => Promise<any>;
  closeAddresses: (guide: number, token: string) => Promise<any>;
  createDelivery: (data: CreateEntregaProps, token: string) => Promise<any>;
  whatsappProps: (data: WhatsappProps, APIKey: string) => Promise<any>;
  listDocument: ( numeroFactura: string | null, idDireccion: number, token: string) => Promise<ApiResponse<DerliveryDocument>>;
  OpneAddressesDelivery: (data: OpneAddressesDeliveryProps, addresseId: number, token: string) => Promise<any>;
  WhatsappTATImage: (data: WhatsappTATImageProps, APIKey: string) => Promise<any>;

}
