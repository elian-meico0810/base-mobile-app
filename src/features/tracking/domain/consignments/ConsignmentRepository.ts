import { Consignment, ConsignmentSummary, RegisterConsignmentRequest } from "./Consignment";

export interface ConsignmentRepository {
    getSummary(codigoGuia: string, token: string): Promise<ConsignmentSummary>;
    registerConsignment(data: RegisterConsignmentRequest, token: string): Promise<Consignment>;
}
