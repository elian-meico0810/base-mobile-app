import { Consignment, ConsignmentSummary, EditConsignmentRequest, RegisterConsignmentRequest } from "./Consignment";

export interface ConsignmentRepository {
    getSummary(codigoGuia: string, token: string): Promise<ConsignmentSummary>;
    registerConsignment(data: RegisterConsignmentRequest, token: string): Promise<Consignment>;
    editConsignment(consignmentId: number, data: EditConsignmentRequest, token: string): Promise<Consignment>;
}
