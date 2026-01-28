import { API_ROUTES } from "@/src/constants/apiRoutes";
import { authApi, authDevApi } from "@/src/features/auth/infrastructure/authApi";
import {
  CreateEntregaProps,
  CreatePaymentTypeProps,
  GenerateQRPorps,
  OpneAddressesDeliveryProps, OpneAddressesProps,
  PaymentGatewayProps, ReportWhatsAppQRPorps,
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

  async successfulBillPayment(numeroFactura: number, token: string, pedidoId: number) {
    try {
      console.log(`${API_ROUTES.WS_ALL_PAYMENT_SUCCESS_FUL}?pedido_id=${pedidoId}&numero_factura=${numeroFactura}`);

      const response = await authApi.get(`${API_ROUTES.WS_ALL_PAYMENT_SUCCESS_FUL}?pedido_id=${pedidoId}&numero_factura=${numeroFactura}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      console.log("response: ", response);

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

};
