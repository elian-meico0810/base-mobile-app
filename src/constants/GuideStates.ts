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
    CLOSE = "Finalizada",
    CLOSE_TWO = "Cerrada"
}

export enum StatusInvoiceID {
    IN_COURSE = 8,
    PENDING = 7,
    CLOSE = 9
}

export enum TypeDelivery {
    ENT_TOTAL = "ENT_TOTAL_TIPO_ENTREGA",
    ENT_PARCIAL = "ENT_PAR_TIPO_ENTREGA",
    RECHAZADO = "RECH_TIPO_ENTREGA"
}

export enum StatusDelivery {
    TOTAL = "total",
    PARCIAL = "parcial",
    RECHAZADO = "rechazo"
}

export enum CausalDelivery {
    PRODUCTOS_DANADOS = "CS_PRODUCTO_DAÑADOS",
    TIENDA_CERRADA = "CS_TIENDA_CERRADA",
    DUENO_NO_CONTESTA = "CS_DUEÑO_NO_CONESTA",
    DINERO_INSUFICIENTE = "CS_DINERO_INSUFICIENTE"
}

export enum OptionsRefusedEnum {
    DINERO = "Dinero",
    DUEÑO = "Dueño",
    TIENDA = "Tienda",
    PRODUCTOS = "Productos"
}


export enum TypeInvoiceEnum {
    CREDITO = "CREDITO",
    CONTADO_EFECTIVO = "CONTADO EFECTIVO"
}