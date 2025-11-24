import { ApiResponse } from "@/src/features/auth/domain/ApiResponse";
import { GuideDetails, RuteInitPorps } from "./DetailsGuide";

export interface DetailsRepository {
  listGuide: (guide: number, token: string) => Promise<ApiResponse<GuideDetails>>;
  sendRouteInit: (data: RuteInitPorps, token: string) => Promise<any>;
}
