import { API_ROUTES } from "@/src/constants/apiRoutes";
import { authApi } from "@/src/features/auth/infrastructure/authApi";
import { Consignment, ConsignmentSummary, RegisterConsignmentRequest } from "../../domain/consignments/Consignment";
import { ConsignmentRepository } from "../../domain/consignments/ConsignmentRepository";

export const consignmentRepositoryImpl: ConsignmentRepository = {
    async getSummary(codigoGuia: string, token: string): Promise<ConsignmentSummary> {
        try {
            const { data } = await authApi.get(`${API_ROUTES.CONSIGNACIONES_RESUMEN}${codigoGuia}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            return data.data;
        } catch (error) {
            throw error;
        }
    },

    async registerConsignment(requestData: RegisterConsignmentRequest, token: string): Promise<Consignment> {
        try {
            const { data } = await authApi.post(API_ROUTES.CONSIGNACIONES_REGISTRAR, requestData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return data;
        } catch (error) {
            throw error;
        }
    }
};
