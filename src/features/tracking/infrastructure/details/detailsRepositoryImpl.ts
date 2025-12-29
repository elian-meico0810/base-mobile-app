import { API_ROUTES } from "@/src/constants/apiRoutes";
import { authApi, authDevApi } from "@/src/features/auth/infrastructure/authApi";
import { PaymentsByInvoicePorps, RuteInitPorps } from "../../domain/details/DetailsGuide";
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
      // return {
      //   statusCode: 200,
      //   data: [
      //     {
      //       idDireccion: 1,
      //       direccion: "Calle 1 #101",
      //       poblacion: "Ciudad 1",
      //       codigoCliente: "C1001",
      //       nombreCliente: "Cliente 1",
      //       count: 2,
      //       latitud: "4.601234",
      //       longitud: "-74.081234",
      //       estado: "Pendiente",
      //       facturas: [
      //         { numeroFactura: "F1-1", valorTotal: 50000, dfr: 5000, valorRecaudar: 45000 }
      //       ]
      //     },
      //     {
      //       idDireccion: 2,
      //       direccion: "Calle 2 #102",
      //       poblacion: "Ciudad 2",
      //       codigoCliente: "C1002",
      //       nombreCliente: "Cliente 2",
      //       count: 3,
      //       latitud: "4.602345",
      //       longitud: "-74.082345",
      //       estado: "Cerrada",
      //       facturas: [
      //         { numeroFactura: "F2-1", valorTotal: 75000, dfr: 5000, valorRecaudar: 70000 }
      //       ]
      //     },
      //     {
      //       idDireccion: 3,
      //       direccion: "Calle 3 #103",
      //       poblacion: "Ciudad 3",
      //       codigoCliente: "C1003",
      //       nombreCliente: "Cliente 3",
      //       count: 1,
      //       latitud: "4.603456",
      //       longitud: "-74.083456",
      //       estado: "En Progreso",
      //       facturas: [
      //         { numeroFactura: "F3-1", valorTotal: 60000, dfr: 10000, valorRecaudar: 50000 }
      //       ]
      //     },
      //     // ... continuar con los registros hasta el 20
      //   ],
      //   message: null,
      //   success: true
      // };
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
      //   {
      // "statusCode": 200,
      // "data": {
      //     "codigoGuia": "0",
      //     "logId": 15,
      //     "rutaId": 4,
      //     "estadoRuta": "En curso"
      // },
      // "message": "Inicio de ruta registrado exitosamente",
      // "success": true
      // }
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

  async listPorductData(token: string) {
    try {
      return {
        "statusCode": 200,
        "data": {
          "id": 54,
          "codigo": "00792983",
          "bodega": "Q01",
          "fecha": "2011-01-21T00:00:00",
          "canal": "MIXTO",
          "codigoCliente": "000000009305",
          "codigoGuia": "24335",
          "dfr": "71979.95",
          "detalles": [
            {
              "id": 30,
              "linea": 2,
              "producto": {
                "id": 30,
                "codigo": "5103           ",
                "nombre": "LONA 180 CALIMA TIPO A "
              },
              "imagenUrl": 'https://th.bing.com/th?id=OIF.%2fuc23H9lZ7AVVE7Zp%2bsJYw&rs=1&pid=ImgDetMain&o=7&rm=3',
              "valorBaseProducto": "7574.00",
              "totalImpuestos": "151006.63",
              "estado": {
                "tipo": 10,
                "nombre": "Validado",
                "codigo": "EST_DET_VALIDADO"
              },
              "unidadesSolicitadas": 198,
              "unidadesRechazadas": 2,
              "unidadesEntregadas": 0,
              "totalEntregado": "17000.00",
              "totalImpuestoEntrega": "20000.00",
              "novedades": [
                {
                  "id": 4,
                  "causal": {
                    "codigo": "CS_NOV_DIN_INSUF",
                    "nombre": "Dinero insuficiente",
                    "requiereEvidencia": false
                  },
                  "valor": "250000.00"
                },
                {
                  "id": 5,
                  "causal": {
                    "codigo": "CS_NOV_PROD_VENC",
                    "nombre": "Producto vencido",
                    "requiereEvidencia": false
                  },
                  "valor": "2.00"
                },
                {
                  "id": 6,
                  "causal": {
                    "codigo": "CS_NOV_PROD_DAÑADO",
                    "nombre": "Producto dañado",
                    "requiereEvidencia": false
                  },
                  "valor": "1.00"
                },
                {
                  "id": 7,
                  "causal": {
                    "codigo": "CS_NOV_PROD_VENC",
                    "nombre": "Producto vencido",
                    "requiereEvidencia": false
                  },
                  "valor": "2.00"
                }
              ]
            },
            {
              "id": 31,
              "linea": 1,
              "producto": {
                "id": 31,
                "codigo": "5407           ",
                "nombre": "TARTAN ROJO 1.40MTS TIPO A "
              },
              "imagenUrl": 'https://th.bing.com/th?id=OIF.%2fuc23H9lZ7AVVE7Zp%2bsJYw&rs=1&pid=ImgDetMain&o=7&rm=3',
              "valorBaseProducto": "5940.00",
              "totalImpuestos": "73930.72",
              "estado": {
                "tipo": 10,
                "nombre": "Validado",
                "codigo": "EST_DET_VALIDADO"
              },
              "unidadesSolicitadas": 100,
              "unidadesRechazadas": 2,
              "unidadesEntregadas": 2,
              "totalEntregado": "100000.00",
              "totalImpuestoEntrega": "200000.00",
              "novedades": [
                {
                  "id": 8,
                  "causal": {
                    "codigo": "CS_NOV_PROD_DAÑADO",
                    "nombre": "Producto dañado",
                    "requiereEvidencia": false
                  },
                  "valor": "1.00"
                }
              ]
            }
          ]
        },
        "message": "Pedido obtenido exitosamente",
        "success": true
      }
    } catch (error) {
      throw error;
    }
  },

};
