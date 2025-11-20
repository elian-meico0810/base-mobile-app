import { ApiResponse } from "@/src/features/auth/domain/ApiResponse";
import { GuideDetails } from "./DetailsGuide";

export interface DetailsRepository {
  listGuide: (guide: number, token: string) => Promise<ApiResponse<GuideDetails>>;
}
