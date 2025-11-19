import { AuthRepository } from "../domain/AuthRepository";
import { authStorage } from "./authStorage";

export const authRepositoryImpl: AuthRepository = {
  async login(guide: string) {
    const payload = {
      idGuia: Number(guide),
      empresa: "Meico",
    };
    //const { data } = await authApi.post(API_ROUTES.LOGIN_GUIDE, payload);
    //return data
    return {
      statusCode: 401,
      data: null,
      message: `Error generando token: La guía ${guide} no tiene direcciones pendientes para ser procesadas.`,
      success: false,
    };
  },

  async logout() {
    await authStorage.removeToken();
  },
};
