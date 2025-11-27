/* Hace referencia a los estados de 
las guías en el sistema de seguimiento */
export enum GuideState {
    Pendiente = "Pendiente",
    EntregaTotal = "Entrega total",
    EntregaParcial = "Entrega parcial",
    Rechazo = "Rechazo",
    Cerrada = "Cerrada"
}

export const validStates: string[] = [
    GuideState.Pendiente
];

/*  Hace referencia a los tipos de QR y 
estados de pago en el sistema de facturación */
export enum TypeQr {
    PASARELA = "Pasarela de Pago",
    BANCARIA = "Aplicación Bancaria"
}

// Estados de FACTURAS
export enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "APPROVED",
    FAILED = "REJECTED"
}

/* Estados de las facturas en el sistema de 
seguimiento para mostrar accciones  */
export enum StatusInvoice {
    IN_COURSE = "En curso",
    PENDING = "Pendiente",
    CLOSE = "Cerrada"
}