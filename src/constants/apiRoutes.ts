export const API_ROUTES = {
  // Back Meico-Track
  LOGIN_GUIDE: "auth/guia/",
  INVOICE_GUIDE_BY_NUMBER_GUDE: "facturas/guia/",
  SEND_ROUTE_INIT: "rutas/inicio/",
  CLOSE_ROUTE: "rutas/finalizacion/",
  OPEN_ADDRESSES: "direcciones/llegada/",
  CLOSE_ADDRESSES: "direcciones/cerrar/",
  GET_ROUTE_BY_CODE_GUIDE: "rutas/guia-by-codigo-guia/",
  CREATE_DELIVERY: "entregas/create-entrega/",
  GET_DOCUMENT: "documentos/get-all/",
  REPORT_NOTIFICTION_WHATSAPP_TAT: "entregas/QR-bancolombia-whatsapp/",
  GET_ORDER: "pedidos/",
  GET_TOKEN_PRODUCTS: "productos/sas-token/",
  GET_MEICOTRACK_TOKEN_PRODUCTS: "productos/meicotrack-token/",
  SENT_ORRDE_ORDER: "pedidos/detalle/",
  SEND_NOVELTY_ORDER: "novedades/registrar/",
  GET_NOVELTY_ORDER_BY_PARAMS: "novedades/novedad-pedido/",
  SEND_ORRDE_ARRAY: "pedidos/detalle/validar_todos/",
  SEND_REPORT_NOLVETY_ARRAY: "entregas/reportar-novedad-pedido/",
  CREATE_PAYMENT_BY_TYPE: "reporte-pago/crear-lote/",
  GET_TYPE_DETAILS_BY_PARAMS: "causales/tipo/",
  GET_REPORT_PAYMENT_IN_APP: "reporte-pago/por-pedido/",
  CREATE_OTP: "otp/direccion/crear/",
  REENTRY_OTP: "otp/direccion/reenviar/",
  VALIDATE_OTP: "otp/verificar/",
  WS_ALL_PAYMENT_SUCCESS_FUL: "reporte-pago/ws-pagos-registrados/",
  // Back contado anticipado
  SEND_PAYMENT_GATEWAY: "pagos/generar-link-pasarela/",
  GENERATE_QR: "pagos/generar_qr_bancolombia/",
  REPORT_NOTIFICTION_WHATSAPP: "pagos/transportista_enviar_linkpago_whatsapp/",
  PAYMENT_SUCCESS_FUL: "facturas/pagos/",
  PAYMENT_SUCCESS_FUL_BY_GUIDE: "transportista/obtener-pagos-por-guia/",
  GET_CONCILIATION_ROUTE: "facturas/resumen-pagos-por-guia/",
  VALIDATE_QR_CEDI: "cedis-qr/validar/",
  DELETE_REPORT_PAYMENT_BY_ORDER: "reporte-pago/eliminar-by-pedido-id/",
  // Consignaciones
  CONSIGNACIONES_RESUMEN: "consignaciones/resumen/",
  CONSIGNACIONES_REGISTRAR: "consignaciones/registrar/",
  CONSIGNACIONES_EDITAR: "consignaciones/editar/",
  CONSIGNACIONES_ELIMINAR: "consignaciones/eliminar/",
};


export const ENV_DEV = {
  KEY_APP: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJhcGltZWljb3RyYWNrQG1laWNvLmNvbS5jbyIsImVtYWlsIjoiYXBpbWVpY290cmFja0BtZWljby5jb20uY28iLCJkaXNwbGF5X25hbWUiOiJBUEkgIiwiZXhwIjo4ODE1NjA2MTM5NCwicGVybWlzc2lvbnMiOlsiQUxMIl0sImNsaWVudF9pZCI6Im1laWNvX3RyYWNrIn0.CfrDOgJNIyJww6XPOxU1U86F_8r5GYEHSR3TRrqp_aU"
}
