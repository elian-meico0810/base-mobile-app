import { API_ROUTES } from "@/src/constants/apiRoutes";
import { authApi, authDevApi } from "@/src/features/auth/infrastructure/authApi";
import {
  AceptationPedidoProps,
  ApproveOrReject,
  CreateEntregaProps,
  CreatePaymentTypeProps,
  GenerateQRPorps,
  NoDeliveryProps,
  NoveltyOrderPayload,
  OpneAddressesDeliveryProps, OpneAddressesProps,
  PaymentGatewayProps, ReportWhatsAppQRPorps,
  UploadEvidenceAcceptationGuidesProps,
  ValidateCodeProps,
  WhatsappProps, WhatsappTATImageProps
} from "../../domain/invoices/InvoicesInterFace";
import { InvoicesRepository, } from "../../domain/invoices/InvoicesRepository";

export const invoiceRepositoryImpl: InvoicesRepository = {

  async sendPaymentGetway(data: PaymentGatewayProps, key: string) {
    try {
      const response = await authDevApi.post(
        API_ROUTES.SEND_PAYMENT_GATEWAY,
        data,
        {
          headers: {
            "api-key": key,
            "Content-Type": "application/json",
          },
        }
      );
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async generateQR(data: GenerateQRPorps, key: string) {
    try {
      const response = await authDevApi.post(API_ROUTES.GENERATE_QR, data, {
        headers: {
          "api-key": key,
          "Content-Type": "application/json",
        },
      });

      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async reportWhatsApp(data: ReportWhatsAppQRPorps, key: string) {
    try {
      const response = await authDevApi.post(API_ROUTES.REPORT_NOTIFICTION_WHATSAPP, data, {
        headers: {
          "api-key": key,
          "Content-Type": "application/json",
        },
      });
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async successfulBillPaymentTwo(numeroFactura: number, token: string, pedidoId: number) {
    try {

      const response = await authApi.get(`${API_ROUTES.WS_ALL_PAYMENT_SUCCESS_FUL}?pedido_id=${pedidoId}&numero_factura=${numeroFactura}`,
        {
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

  async successfulBillPayment(invoiceNumber: number, key: string) {
    try {

      const response = await authDevApi.get(`${API_ROUTES.PAYMENT_SUCCESS_FUL}${invoiceNumber}/`, {
        headers: {
          "api-key": key
        },
      });
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async openAddresses(data: OpneAddressesProps, addresseId: number, token: string) {
    try {
      const response = await authApi.post(
        `${API_ROUTES.OPEN_ADDRESSES}${addresseId}/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Aquí devuelves solo el JSON que envió el servidor
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async closeAddresses(addresseId: number, token: string) {
    try {
      const response = await authApi.post(
        `${API_ROUTES.CLOSE_ADDRESSES}${addresseId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Aquí devuelves solo el JSON que envió el servidor
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async createDelivery(data: CreateEntregaProps, token: string) {
    try {
      const response = await authApi.post(
        `${API_ROUTES.CREATE_DELIVERY}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Aquí devuelves solo el JSON que envió el servidor
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async whatsappProps(data: WhatsappProps, key: string) {
    try {
      const response = await authDevApi.post(
        `${API_ROUTES.REPORT_NOTIFICTION_WHATSAPP}`,
        data,
        {
          headers: {
            "api-key": key
          },
        }
      );
      // Aquí devuelves solo el JSON que envió el servidor
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async listDocument(numeroFactura: string | null, idDireccion: number, token: string) {
    try {
      const response = await authApi.get(
        `${API_ROUTES.GET_DOCUMENT}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: {
            direccion_id: idDireccion,
            document_meico: numeroFactura,
          }
        }
      );
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async OpneAddressesDelivery(data: OpneAddressesDeliveryProps, addresseId: number, token: string) {
    try {
      const response = await authApi.post(
        `${API_ROUTES.OPEN_ADDRESSES}${addresseId}/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Aquí devuelves solo el JSON que envió el servidor
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
    }
  },

  async WhatsappTATImage(data: WhatsappTATImageProps, token: string) {
    try {
      const response = await authApi.post(
        `${API_ROUTES.REPORT_NOTIFICTION_WHATSAPP_TAT}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Aquí devuelves solo el JSON que envió el servidor
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async createPaymentType(data: CreatePaymentTypeProps[], token: string) {
    try {

      const response = await authApi.post(
        `${API_ROUTES.CREATE_PAYMENT_BY_TYPE}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Aquí devuelves solo el JSON que envió el servidor
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async successOrderPayment(idPedido: number, token: string) {
    try {

      const response = await authApi.get(`${API_ROUTES.GET_REPORT_PAYMENT_IN_APP}${idPedido}/`, {
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

  async successTypeCashPayment(guide: string, token: string) {
    try {

      const response = await authApi.get(`${API_ROUTES.GET_REPRORT__APYMENT_BY_CODE_GUIDE}${guide}/`, {
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

  async typeParameterValue(type_paramter: string, token: string) {
    try {

      const response = await authApi.get(`${API_ROUTES.GET_PARAMETER_VALUE_BY_TYPE}${type_paramter}/`, {
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

  async successOrderArrayPayment(arrayIds: any, token: string) {
    try {

      const response = await authApi.get(`${API_ROUTES.GET_REPORT_PAYMENT_IN_APP_BY_ARRAY_ID_ORDERS}?array_ids=${arrayIds}`, {
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

  async successfulBillArrayPayment(numeroFactura: any, token: string, arrayIds: any) {
    try {

      const response = await authApi.get(`${API_ROUTES.WS_ALL_PAYMENT_SUCCESS_FUL_ARRAY}?array_ids=${arrayIds}&numero_factura=${numeroFactura}`,
        {
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

  async registerNoDelivery(data: NoDeliveryProps, token: string) {
    try {
      const response = await authApi.post(
        `${API_ROUTES.NO_DELIVERY}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async listTotalsGuide(guide: string, token: string, isEjecute?: string | null
  ) {
    try {
      const url = isEjecute
        ? `${API_ROUTES.GET_TOTALS_GUIDE_DETAILS}${guide}/?is_ejecute=${isEjecute}`
        : `${API_ROUTES.GET_TOTALS_GUIDE_DETAILS}${guide}/`;

      const response = await authApi.get(url, {
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

  async apporveOrReject(data: ApproveOrReject, token: string) {
    try {
      const response = await authApi.post(
        `${API_ROUTES.APPROVE_OR_REJECT}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      // Aquí devuelves solo el JSON que envió el servidor
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async getTypeCash(token: string) {
    try {
      const response = await authApi.get(`${API_ROUTES.GET_TYPE_CASH_CONDITIONS}`,
        {
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

  async uploadEvidenceAcceptationGuides(data: UploadEvidenceAcceptationGuidesProps, token: string) {
    try {
      const response = await authApi.post(
        API_ROUTES.UPLOAD_EVIDENCE_ACCEPTATION_GUIDES,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async aceptationOrder(data: AceptationPedidoProps, token: string) {
    try {
      const response = await authApi.post(
        `${API_ROUTES.CREATE_ACEPTATION_GUIDE}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Aquí devuelves solo el JSON que envió el servidor
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error) {
      throw error;
    }
  },

  async reportNovelty(data: NoveltyOrderPayload, token: string) {
    try {
      const response = await authApi.post(
        API_ROUTES.ACEPTATION_ORDER_NOVELTY,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return (typeof response.data === "string") ? JSON.parse(response.data) : response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async validateCode(data: ValidateCodeProps, token: string) {
    try {
      const response = await authApi.post(
        `${API_ROUTES.VALIDATE_CODE_BY_BODEGA}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Aquí devuelves solo el JSON que envió el servidor
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
};

