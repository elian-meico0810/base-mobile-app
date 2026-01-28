import { ConsignmentSummary } from "./Consignment";

export interface ConsignmentRepository {
    getSummary(codigoGuia: string, token: string): Promise<ConsignmentSummary>;
}
