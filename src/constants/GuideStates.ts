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
    CONTADO_EFECTIVO = "CONTADO EFECTIVO",
    ANTICIPO = "CONTADO ANTICIPADO",
    MIXTO = "MIXTO",
    PAGOS_APLICATIVO_MEICO = "PAGOS APLICATIVO MEICO"
}

export enum TypeConPagoEnum {
    TAT = "TAT",
    MIXTO = "MIXTO",
    PGM = "PGM",
}

export enum TypeCaculateValueEnum {
    ACTION_1 = "TOTAL_VALUE_BY_PRODUCTS",
    ACTION_2 = "TOTAL_UNIT_VALUE_BY_PRODUCTS",
    ACTION_3 = "TOTAL_VALUE_BY_PRODUCTS_REFUSED",
    ACTION_4 = "TOTAL_TAXES_BY_ORDER",
    ACTION_5 = "TOTAL_ENTRY_REFUSED",
    ACTION_6 = "TOTAL_UNITS_ENTRY_REFUSED",
    ACTION_7 = "TOTAL_ENTRY_TAX_REFUSED",
    ACTION_8 = "TATAL_REFUSED_BY_ORDERS",
    ACTION_9 = "TOTAL_UNIT_ENTRY"
}

export enum TyepeCausalRefusedEnum {
    DINERO_INSUFICIENTE = "Dinero insuficiente",
    PRODUCTOS_DANADOS = "Producto dañado",
    PRODUCTOS_VENCIDOS = "Producto vencido",
    OTROS = "Otro"
}

export enum CausalRefusedEnum {
    CS_NOV_DIN_INSUF = "CS_NOV_DIN_INSUF",
    CS_NOV_PROD_DAÑADO = "CS_NOV_PROD_DAÑADO",
    CS_NOV_PROD_VENC = "CS_NOV_PROD_VENC",
    CS_NOV_OTRO = "CS_NOV_OTRO"
}

export enum TypeDetailsEnum {
    CAUS_REP_NOVEDAD = "CAUS_REP_NOVEDAD",
    CAUS_REP_PEDIDO = "CAUS_REP_PEDIDO",
    MAXIMUM_AMOUNT = "MAXIMUM_AMOUNT"
}


export enum TypePaymentEnum {
    CONTIGENCIA = "Pagos contingencia",
    PASARELA = "Pasarela de pago",
    OTRO = "Otro",
}

export enum TipeCodeOTP {
    EST_OTP_ENVIADO = "EST_OTP_ENVIADO",
    EST_OTP_VALIDADO = "EST_OTP_VALIDADO"
}

export enum TypeEntry {
    ENTREGA_OTRO_DIA = "ENTREGA_OTRO_DIA",
    NO_ENTREGADO = "NO_ENTREGADO"
}


export enum TypeStatusEnum {
    EST_PEDI_PEND = "EST_PEDI_PEND",
    EST_PEDI_ENT_TOT = "EST_PEDI_ENT_TOT",
    EST_PEDI_ENT_PARC = "EST_PEDI_ENT_PARC",
    EST_PEDI_RECH = "EST_PEDI_RECH",
    EST_PEDIDO_ACEPT = "EST_PEDIDO_ACEPT"
}


export enum TypeValueParameterEnum {
    TEXT_ODER = "TEXT_ODER",
    TEXT_NOVELTY_ODER = "TEXT_NOVELTY_ODER",
    MARGEN_TOLERANCIA = "MARGEN_TOLERANCIA"

}