import { ApiResponse } from "@/src/features/auth/domain/ApiResponse";
import { Cause, DataUploadFIlePprops, Document, EvidenciaOTPItemOTP, GuideDetails, ListAceptationGuide, ListInfOTP, NoveltyRefusedProps, NovletyOrder, OrderGroup, PaymentsByInvoicePorps, ReEntryDeliveryProps, ReentryOTPProps, ReportePagoTotal, ReportNoveltyFileArrayProps, RuteByCodeGuide, RuteInitPorps, SendOrderArrayProps, SendOrderProps, SendOTOPProps, TokenProducts, ValidateCediQRResponse, ValidateCodeOTPProps } from "./DetailsGuide";

export interface DetailsRepository {
  listGuide: (guide: number, token: string) => Promise<ApiResponse<GuideDetails>>;
  sendRouteInit: (data: RuteInitPorps, token: string) => Promise<any>;
  closeRouteInit: (data: RuteInitPorps, token: string) => Promise<any>;
  listRouteByCodeGuide: (guide: number, token: string) => Promise<ApiResponse<RuteByCodeGuide>>;
  paymentsByGuide: (data: PaymentsByInvoicePorps, token: string) => Promise<any>;
  getConciliationRoute(guide: string, token: string): Promise<any>;
  listPorductData: (token: string, order: number) => Promise<ApiResponse<Document>>;
  tokenPorducts: (token: string) => Promise<ApiResponse<TokenProducts>>;
  tokenPorductsMeicoTrack: (token: string) => Promise<ApiResponse<TokenProducts>>;
  sendOrder: (data: SendOrderProps, detalleId: string, token: string) => Promise<any>;
  noveltyOrder: (data: NoveltyRefusedProps[], token: string) => Promise<any>;
  sendOrderArray: (data: SendOrderArrayProps[], token: string) => Promise<any>;
  reportNoveltyFileArray: (data: ReportNoveltyFileArrayProps, token: string) => Promise<any>;
  novletyOrderByParams: (orderId: number, token: string) => Promise<ApiResponse<NovletyOrder>>;
  listTypeDetails: (type: string, token: string) => Promise<ApiResponse<Cause>>;
  novletyOrderByids: (orderId: any, token: string) => Promise<ApiResponse<NovletyOrder>>;
  sendOTP: (data: SendOTOPProps, token: string) => Promise<any>;
  reentryOTP: (data: ReentryOTPProps, token: string) => Promise<any>;
  validateCodeOTP: (data: ValidateCodeOTPProps, token: string) => Promise<any>;
  validateCediQR: (qr: string, token: string) => Promise<ValidateCediQRResponse>;
  deleteByOrder: (token: string, order: string) => Promise<any>;
  dataUploadFIle: (data: DataUploadFIlePprops, token: string) => Promise<any>;
  listAceptationGuide: (guide: string, token: string) => Promise<ApiResponse<ListAceptationGuide[]>>;
  getReportPayment: (guide: string, token: string) => Promise<ApiResponse<ReportePagoTotal>>;
  listInfOTP: (direccion_id: string, numberInvoice: string, token: string) => Promise<ApiResponse<ListInfOTP>>;
  evidenciaOTPItem: (direccion_id: string, numberInvoice: string, token: string) => Promise<ApiResponse<EvidenciaOTPItemOTP[]>>;
  reEntryDelivery: (data: ReEntryDeliveryProps, token: string) => Promise<any>;
  sendOTPNotPayment: (data: SendOTOPProps, token: string) => Promise<any>;
  reentryOTPNotPayment: (data: ReentryOTPProps, token: string) => Promise<any>;
  listAceptationOrderDetails: (token: string, guide: number, codigo: string) => Promise<ApiResponse<OrderGroup[]>>;

}
