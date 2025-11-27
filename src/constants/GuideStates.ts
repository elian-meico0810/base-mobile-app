// Enum para referencia
export enum GuideState {
    Pendiente = "Pendiente",
    EntregaTotal = "Entrega total",
    EntregaParcial = "Entrega parcial",
    Rechazo = "Rechazo",
    Cerrada = "Cerrada"
}

// Array de strings para filtrar data
export const validStates: string[] = [
    GuideState.Pendiente
];


export enum TypeQr {
    PASARELA = "Pasarela de Pago",
    BANCARIA = "Aplicación Bancaria"
}

export enum PaymentStatus {
    PENDING = "PendiPENDINGng",
    COMPLETED = "APPROVED",
    FAILED = "REJECTED"
}