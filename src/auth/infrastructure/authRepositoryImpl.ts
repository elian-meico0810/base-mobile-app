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
    
    /*return {
      statusCode: 200,
      data: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJudW1lcm9HdWlhIjo3MTM4MCwiZW1wcmVzYSI6Ik1laWNvIiwicGxhY2EiOiJxZWs1NzMiLCJleHAiOjE3NjM2MTQ3NDB9.bj5tTfNMWGELmHEep7NXKwfxf-1_7E5sBLPCdmLn7wg",
      message: "Guía autenticada con éxito",
      success: true
    }*/

  },

  async logout() {
    await authStorage.removeToken();
  },
};
