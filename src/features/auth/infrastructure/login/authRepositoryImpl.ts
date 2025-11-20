import { API_ROUTES } from "@/src/constants/apiRoutes";
import { AuthRepository } from "../../domain/login/AuthRepository";
import { authApi } from "../authApi";
import { authStorage } from "./authStorage";

export const authRepositoryImpl: AuthRepository = {
  async login(guide: string) {
    const payload = {
      idGuia: Number(guide),
      empresa: "Meico",
    };
    const { data } = await authApi.post(API_ROUTES.LOGIN_GUIDE, payload);
    return data


  },

  async logout() {
    await authStorage.removeToken();
  },
};
