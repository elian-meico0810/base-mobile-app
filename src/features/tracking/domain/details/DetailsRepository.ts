import { ApiResponse } from "@/src/features/auth/domain/ApiResponse";
import { Document, GuideDetails, PaymentsByInvoicePorps, RuteByCodeGuide, RuteInitPorps } from "./DetailsGuide";

export interface DetailsRepository {
  listGuide: (guide: number, token: string) => Promise<ApiResponse<GuideDetails>>;
  sendRouteInit: (data: RuteInitPorps, token: string) => Promise<any>;
  closeRouteInit: (data: RuteInitPorps, token: string) => Promise<any>;
  listRouteByCodeGuide: (guide: number, token: string) => Promise<ApiResponse<RuteByCodeGuide>>;
  paymentsByGuide: (data: PaymentsByInvoicePorps, token: string) => Promise<any>;
  listPorductData: (token: string) => Promise<ApiResponse<Document>>;

}
