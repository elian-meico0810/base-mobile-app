import { API_ROUTES } from "@/src/constants/apiRoutes";
import { authApi } from "@/src/features/auth/infrastructure/authApi";
import { DetailsRepository } from "../../domain/details/DetailsRepository";

export const detailsRepositoryImpl: DetailsRepository = {
  async listGuide(guide: number, token: string) {
    try {
      const { data } = await authApi.get(`${API_ROUTES.INVOICE_GUIDE_BY_NUMBER_GUDE}${guide}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      throw error;
    }
  },
};
