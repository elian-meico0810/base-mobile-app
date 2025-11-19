import { ApiResponse } from "@/src/features/auth/domain/ApiResponse";
import { GuideDetails } from "./DetailsGuide";

export interface DetailsRepository {
  listGuide: (guide: number) => Promise<ApiResponse<GuideDetails>>;
}
