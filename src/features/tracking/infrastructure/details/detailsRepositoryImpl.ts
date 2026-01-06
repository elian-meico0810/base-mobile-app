import { API_ROUTES } from "@/src/constants/apiRoutes";
import { authApi, authDevApi } from "@/src/features/auth/infrastructure/authApi";
import { NoveltyRefusedProps, PaymentsByInvoicePorps, RuteInitPorps, SendOrderArrayProps, SendOrderProps } from "../../domain/details/DetailsGuide";
import { DetailsRepository } from "../../domain/details/DetailsRepository";

export const detailsRepositoryImpl: DetailsRepository = {
  async listGuide(guide: number, token: string) {
    try {
      const { data } = await authApi.get(`${API_ROUTES.INVOICE_GUIDE_BY_NUMBER_GUDE}${guide}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data
    } catch (error) {
      throw error;
    }
  },

  async sendRouteInit(data: RuteInitPorps, token: string) {
    try {
      const response = await authApi.post(API_ROUTES.SEND_ROUTE_INIT, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async closeRouteInit(data: RuteInitPorps, token: string) {
    try {
      const response = await authApi.post(API_ROUTES.CLOSE_ROUTE, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async listRouteByCodeGuide(guide: number, token: string) {
    try {
      const { data } = await authApi.get(`${API_ROUTES.GET_ROUTE_BY_CODE_GUIDE}${guide}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data
    } catch (error) {
      throw error;
    }
  },

  async paymentsByGuide(data: PaymentsByInvoicePorps, key: string) {
    try {
      const response = await authDevApi.post(`${API_ROUTES.PAYMENT_SUCCESS_FUL_BY_GUIDE}`, data, {
        headers: {
          "api-key": key
        },
      });

      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async listPorductData(token: string, order: number) {
    try {
      const response = await authApi.get(`${API_ROUTES.GET_ORDER}${order}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async tokenPorducts(token: string) {
    try {
      const response = await authApi.get(`${API_ROUTES.GET_TOKEN_PRODUCTS}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async sendOrder(data: SendOrderProps, detalleId: string, token: string) {
    try {
      const response = await authApi.post(`${API_ROUTES.SENT_ORRDE_ORDER}${detalleId}/validar/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async noveltyOrder(data: NoveltyRefusedProps[], token: string) {
    try {
      const response = await authApi.post(`${API_ROUTES.SEND_NOVELTY_ORDER}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async sendOrderArray(data: SendOrderArrayProps[], token: string) {
    try {
      const response = await authApi.post(`${API_ROUTES.SENT_ORRDE_ARRAY}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },
};
