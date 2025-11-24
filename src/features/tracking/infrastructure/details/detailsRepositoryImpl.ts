import { API_ROUTES } from "@/src/constants/apiRoutes";
import { authApi } from "@/src/features/auth/infrastructure/authApi";
import { RuteInitPorps } from "../../domain/details/DetailsGuide";
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
      return response;
    } catch (error) {
      throw error;
    }
  }


};
