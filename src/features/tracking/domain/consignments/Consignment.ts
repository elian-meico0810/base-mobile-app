export interface ConsignmentEvidence {
    id: number;
    nombre: string;
    extensionArchivo: string;
    url: string;
    fecha: string;
}

export interface Consignment {
    id: number;
    rutaId: number;
    valorConsignado: number;
    fechaHoraDispositivo: string;
    fechaHoraCreacion: string;
    usuario: string;
    evidencias: ConsignmentEvidence[];
}

export interface ConsignmentSummary {
    totalEfectivo: number;
    totalConsignado: number;
    porConsignar: number;
    consignaciones: Consignment[];
}
