import { ApiResponse } from "@/src/features/auth/domain/ApiResponse";
import { GenerateQRPorps, GuideDetails, PaymentGatewayProps, ReportWhatsAppQRPorps, RuteInitPorps } from "./DetailsGuide";

export interface DetailsRepository {
  listGuide: (guide: number, token: string) => Promise<ApiResponse<GuideDetails>>;
  sendRouteInit: (data: RuteInitPorps, token: string) => Promise<any>;
  sendPaymentGetway: (data: PaymentGatewayProps, token: string) => Promise<any>;
  generateQR: (data: GenerateQRPorps, token: string) => Promise<any>;
  reportWhatsApp: (data: ReportWhatsAppQRPorps, token: string) => Promise<any>;
  successfulBillPayment: (guide: number, token: string) => Promise<any>;
}
