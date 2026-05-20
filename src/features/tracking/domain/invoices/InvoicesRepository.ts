import { ApiResponse } from "@/src/features/auth/domain/ApiResponse";
import { OrderGroup } from "../details/DetailsGuide";
import { AceptationPedidoProps, ApproveOrReject, CreateCargueProps, CreateEntregaProps, CreateNotEntryCargueProps, CreatePaymentTypeProps, DerliveryDocument, GenerateQRPorps, NoDeliveryProps, NoveltyCarguePayload, NoveltyOrderPayload, OpneAddressesDeliveryProps, OpneAddressesProps, PaymentGatewayProps, ReportWhatsAppQRPorps, SuccessOrderArrayPayment, successOrderCashPayment, successOrderPayment, TypeParameterValue, UploadEvidenceAcceptationGuidesProps, ValidateCodeCargueProps, ValidateCodeProps, WhatsappProps, WhatsappTATImageProps } from "./InvoicesInterFace";

export interface InvoicesRepository {
  sendPaymentGetway: (data: PaymentGatewayProps, token: string) => Promise<any>;
  generateQR: (data: GenerateQRPorps, token: string) => Promise<any>;
  reportWhatsApp: (data: ReportWhatsAppQRPorps, token: string) => Promise<any>;
  successfulBillPayment: (numeroFactura: number, token: string) => Promise<any>;
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
  successOrderArrayPayment: (arrayIds: any, token: string)  => Promise<ApiResponse<SuccessOrderArrayPayment>>;
  successfulBillArrayPayment: (numeroFactura: any, token: string, arrayIds: any) => Promise<any>;
  successfulBillPaymentTwo: (numeroFactura: number, token: string, pedidoId: number) => Promise<any>;
  registerNoDelivery: (data: NoDeliveryProps, token: string) => Promise<any>;
  listTotalsGuide: (guide: string, token: string, isEjecute?: string | null)  => Promise<ApiResponse<OrderGroup>>;
  apporveOrReject: (data: ApproveOrReject, token: string) => Promise<any>;
  getTypeCash: (token: string)  => Promise<ApiResponse<TypeParameterValue>>;
  uploadEvidenceAcceptationGuides: (data: UploadEvidenceAcceptationGuidesProps, token: string) => Promise<any>;
  aceptationOrder: (data: AceptationPedidoProps, token: string) => Promise<any>;
  reportNovelty: (data: NoveltyOrderPayload, token: string) => Promise<any>;
  validateCode: (data: ValidateCodeProps, token: string) => Promise<any>;
  createCargue: (data: CreateCargueProps, token: string) => Promise<any>;
  reportNoveltyCargue: (data: NoveltyCarguePayload, token: string) => Promise<any>;
  validateCodeCargue: (data: ValidateCodeCargueProps, token: string) => Promise<any>;
  createNotEntry: (data: CreateNotEntryCargueProps, token: string) => Promise<any>;

}
