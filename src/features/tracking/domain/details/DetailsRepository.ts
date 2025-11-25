import { ApiResponse } from "@/src/features/auth/domain/ApiResponse";
import { GenerateQRPorps, GuideDetails, PaymentGetwayPorps, RuteInitPorps } from "./DetailsGuide";

export interface DetailsRepository {
  listGuide: (guide: number, token: string) => Promise<ApiResponse<GuideDetails>>;
  sendRouteInit: (data: RuteInitPorps, token: string) => Promise<any>;
  sendPaymentGetway: (data: PaymentGetwayPorps, token: string) => Promise<any>;
  generateQR: (data: GenerateQRPorps, token: string) => Promise<any>;
}
