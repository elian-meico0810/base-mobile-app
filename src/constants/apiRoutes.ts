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
  REENTRY_OTP_NOT_PAYMENT: "otp/direccion/reenviar-sin-pago/",
  VALIDATE_OTP: "otp/verificar/",
  WS_ALL_PAYMENT_SUCCESS_FUL: "reporte-pago/ws-pagos-registrados/",
  GET_INFO_BY_DIRECTION_OF_OTP: "otp/info-otp-by-direccion-id/",
  GET_REPRORT__APYMENT_BY_CODE_GUIDE: "reporte-pago/por-guia-in-efecty/",
  GET_PARAMETER_VALUE_BY_TYPE: "valores-parametrizados/get-valores-parametrizados/",
  GET_REPORT_PAYMENT_IN_APP_BY_ARRAY_ID_ORDERS: "reporte-pago/por-array-of-pedido/",
  WS_ALL_PAYMENT_SUCCESS_FUL_ARRAY: "reporte-pago/ws-pagos-registrados-array/",
  POST_EVIDENCE_OTP: "evidencias-otp/upload-file/",
  NO_DELIVERY: "entregas/no-entrega/",
  GET_NOVELTY_ORDER_BY_IDS:"novedades/novedad-pedido-in-ids/",
  GET_TYPE_CASH_CONDITIONS:"valores-parametrizados/get-valores-parametrizados/TYPE_CASH_CONDITIONS/",
  UPLOAD_EVIDENCE_ACCEPTATION_GUIDES: "evidencias-aceptacion-guias/upload-file/",
  GET_EVIDENCE_OTP_BY_DIRECTION:"evidencias-otp/get-all/",
  SEND_REENTRY_DELIVERY:"pedidos/send-pedidos/reprogramados/",
  CREATE_OTP_NOT_PAYMENT: "otp/direccion/crear-sin-pago/",
  CREATE_ACEPTATION_GUIDE:"aceptacion-pedido/crear/",
  // Back contado anticipado
  SEND_PAYMENT_GATEWAY: "pagos/generar-link-pasarela/",
  GENERATE_QR: "pagos/generar_qr_bancolombia/",
  REPORT_NOTIFICTION_WHATSAPP: "pagos/transportista_enviar_linkpago_whatsapp/",
  PAYMENT_SUCCESS_FUL: "facturas/pagos/",
  PAYMENT_SUCCESS_FUL_BY_GUIDE: "transportista/obtener-pagos-por-guia/",
  GET_CONCILIATION_ROUTE: "facturas/resumen-pagos-por-guia/",
  VALIDATE_QR_CEDI: "cedis-qr/validar/",
  DELETE_REPORT_PAYMENT_BY_ORDER: "reporte-pago/eliminar-by-pedido-id/",
  GET_ACEPTATION_GUIDE: "aceptacion-guia/get-all/",
  GET_TOTALS_GUIDE_DETAILS: "facturas/total-guia-detalle/",
  APPROVE_OR_REJECT: "aceptacion-guia/approve-or-reject/",
  // Consignaciones
  CONSIGNACIONES_RESUMEN: "consignaciones/resumen/",
  CONSIGNACIONES_RESUMEN_BY_CODE: "consignaciones/resumen-by-codigo-guia/",
  CONSIGNACIONES_REGISTRAR: "consignaciones/registrar/",
  CONSIGNACIONES_EDITAR: "consignaciones/editar/",
  CONSIGNACIONES_ELIMINAR: "consignaciones/eliminar/",
  GET_REPORTS_PAYMENT_BY_GUIDE: "direcciones/obtener-reportes-pago-by-guide/",

};


export const ENV_DEV = {
  // ============================================================================================================================================================
  //Qa
  KEY_APP: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJhcGltZWljb3RyYWNrQG1laWNvLmNvbS5jbyIsImVtYWlsIjoiYXBpbWVpY290cmFja0BtZWljby5jb20uY28iLCJkaXNwbGF5X25hbWUiOiJBUEkgIiwiZXhwIjo4ODE1NjA2MTM5NCwicGVybWlzc2lvbnMiOlsiQUxMIl0sImNsaWVudF9pZCI6Im1laWNvX3RyYWNrIn0.CfrDOgJNIyJww6XPOxU1U86F_8r5GYEHSR3TRrqp_aU"
  // ============================================================================================================================================================


  // ============================================================================================================================================================
  // Prod
  // KEY_APP: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJhcGltZWljb3RyYWNrQG1laWNvLmNvbS5jbyIsImVtYWlsIjoiYXBpbWVpY290cmFja0BtZWljby5jb20uY28iLCJkaXNwbGF5X25hbWUiOiJBUEkgIiwiZXhwIjo4ODE1NjA2MTM5NywicGVybWlzc2lvbnMiOlsiQUxMIl0sImNsaWVudF9pZCI6Im1laWNvX3RydWNrX3RyYW5zcG9ydGFkb3IifQ.X1cwgIQC9sWRA2SACv6JillhAg4cDkX7UQBtE5jqLds"
  // ============================================================================================================================================================


}
