import { ApiResponse } from "@/src/features/auth/domain/ApiResponse";
import { Cause, Document, GuideDetails, NoveltyRefusedProps, NovletyOrder, PaymentsByInvoicePorps, ReentryOTPProps, ReportNoveltyFileArrayProps, RuteByCodeGuide, RuteInitPorps, SendOrderArrayProps, SendOrderProps, SendOTOPProps, TokenProducts } from "./DetailsGuide";

export interface DetailsRepository {
  listGuide: (guide: number, token: string) => Promise<ApiResponse<GuideDetails>>;
  sendRouteInit: (data: RuteInitPorps, token: string) => Promise<any>;
  closeRouteInit: (data: RuteInitPorps, token: string) => Promise<any>;
  listRouteByCodeGuide: (guide: number, token: string) => Promise<ApiResponse<RuteByCodeGuide>>;
  paymentsByGuide: (data: PaymentsByInvoicePorps, token: string) => Promise<any>;
  listPorductData: (token: string, order: number) => Promise<ApiResponse<Document>>;
  tokenPorducts: (token: string) => Promise<ApiResponse<TokenProducts>>;
  sendOrder: (data: SendOrderProps, detalleId: string, token: string) => Promise<any>;
  noveltyOrder: (data: NoveltyRefusedProps[], token: string) => Promise<any>;
  sendOrderArray: (data: SendOrderArrayProps[], token: string) => Promise<any>;
  reportNoveltyFileArray: (data: ReportNoveltyFileArrayProps, token: string) => Promise<any>;
  novletyOrderByParams: (orderId: number, token: string) => Promise<ApiResponse<NovletyOrder>>;
  listTypeDetails: (type: string, token: string) => Promise<ApiResponse<Cause>>;
  sendOTP: (data: SendOTOPProps, token: string) => Promise<any>;
  reentryOTP: (data: ReentryOTPProps, token: string) => Promise<any>;

}
