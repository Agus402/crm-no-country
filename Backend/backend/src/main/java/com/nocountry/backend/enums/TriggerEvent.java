package com.nocountry.backend.enums;

public enum TriggerEvent {
    LEAD_CREATED, // Nuevo Lead Creado
    DEMO_COMPLETED, // Demo Completada
    INVOICE_SENT, // Factura Enviada
    NO_RESPONSE_7_DAYS, // Sin Respuesta (7 días)
    CONTRACT_SIGNED, // Contrato Firmado
    PAYMENT_RECEIVED, // Pago Recibido
    STAGE_CHANGED // Cambio de Etapa
}
