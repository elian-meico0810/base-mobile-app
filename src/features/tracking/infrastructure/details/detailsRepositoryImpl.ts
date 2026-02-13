import { API_ROUTES } from "@/src/constants/apiRoutes";
import { authApi, authDevApi } from "@/src/features/auth/infrastructure/authApi";
import { ConciliationRouteResponse, NoveltyRefusedProps, PaymentsByInvoicePorps, ReentryOTPProps, ReportNoveltyFileArrayProps, RuteInitPorps, SendOrderArrayProps, SendOrderProps, SendOTOPProps, ValidateCediQRResponse, ValidateCodeOTPProps } from "../../domain/details/DetailsGuide";
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

  async tokenPorductsMeicoTrack(token: string) {
    try {
      const response = await authApi.get(`${API_ROUTES.GET_MEICOTRACK_TOKEN_PRODUCTS}`, {
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
      const response = await authApi.post(`${API_ROUTES.SEND_ORRDE_ARRAY}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async reportNoveltyFileArray(data: ReportNoveltyFileArrayProps, token: string) {
    try {
      const response = await authApi.post(`${API_ROUTES.SEND_REPORT_NOLVETY_ARRAY}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async novletyOrderByParams(orderId: number, token: string) {
    try {
      const response = await authApi.get(`${API_ROUTES.GET_NOVELTY_ORDER_BY_PARAMS}${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async listTypeDetails(typeDetails: string, token: string) {
    try {
      const response = await authApi.get(`${API_ROUTES.GET_TYPE_DETAILS_BY_PARAMS}?tipo=${typeDetails}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async sendOTP(data: SendOTOPProps, token: string) {
    try {
      const response = await authApi.post(`${API_ROUTES.CREATE_OTP}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async getConciliationRoute(
    guide: string,
    token: string,
  ): Promise<ConciliationRouteResponse> {
    const response = await authApi.post(
      API_ROUTES.GET_CONCILIATION_ROUTE,
      { codigoGuia: guide },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const raw =
      typeof response.data === "string"
        ? JSON.parse(response.data)
        : response.data;

    if (!raw.success || raw.statusCode !== 200) {
      throw new Error(raw.message || "Error conciliación");
    }

    const d = raw.data;

    return {
      valor_total: Number(d.valor_total ?? 0),
      valor_recaudado: Number(d.valor_recaudado ?? 0),
      total_rechazado: Number(d.total_rechazado ?? 0),
      recaudo_completo: Boolean(d.recaudo_completo),
      concepto: {
        efectivo: Number(d.concepto?.efectivo ?? 0),
        qr_link: Number(d.concepto?.qr_link ?? 0),
        consignaciones: Number(d.concepto?.consignaciones ?? 0),
        otros: Number(d.concepto?.otros ?? 0),
      },
    };
  },

  async reentryOTP(data: ReentryOTPProps, token: string) {
    try {
      const response = await authApi.post(`${API_ROUTES.REENTRY_OTP}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error: any) {
      return {
        statusCode: error.response?.status ?? 500,
        message:
          error.response?.data?.message ??
          "Ocurrió un error inesperado",
        success: false,
        data: null,
      };
    }
  },

  async validateCodeOTP(data: ValidateCodeOTPProps, token: string) {
    try {
      const response = await authApi.post(`${API_ROUTES.VALIDATE_OTP}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error: any) {
      return {
        statusCode: error.response?.status ?? 500,
        message:
          error.response?.data?.message ??
          "Ocurrió un error inesperado",
        success: false,
        data: null,
      };
    }
  },

  async validateCediQR(qr: string, token: string): Promise<ValidateCediQRResponse> {
    const response = await authApi.post(`${API_ROUTES.VALIDATE_QR_CEDI}`,
      { qr },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw =
      typeof response.data === "string"
        ? JSON.parse(response.data)
        : response.data;

    if (!raw.success || raw.statusCode !== 200) {
      throw new Error(raw.message || "Código QR no válido");
    }

    return raw.data;
  },

  async deleteByOrder(token: string, order: string): Promise<void> {
    try {
      await authApi.delete(`${API_ROUTES.DELETE_REPORT_PAYMENT_BY_ORDER}${order}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  async listInfOTP(direccion_id: string, token: string) {
    try {
      const response = await authApi.get(`${API_ROUTES.GET_TYPE_DETAILS_BY_PARAMS}${direccion_id}`, {
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
