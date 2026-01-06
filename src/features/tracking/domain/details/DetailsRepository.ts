import { ApiResponse } from "@/src/features/auth/domain/ApiResponse";
import { Document, GuideDetails, NoveltyRefusedProps, PaymentsByInvoicePorps, RuteByCodeGuide, RuteInitPorps, SendOrderArrayProps, SendOrderProps, TokenProducts } from "./DetailsGuide";

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

}
