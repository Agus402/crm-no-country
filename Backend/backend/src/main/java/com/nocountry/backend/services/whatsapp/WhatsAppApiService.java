package com.nocountry.backend.services.whatsapp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@Slf4j // Para usar logger.info/error
public class WhatsAppApiService {

    // URL base configurada en .env (https://graph.facebook.com/v19.0/<PHONE_NUMBER_ID>)
    @Value("${WHATSAPP_API_BASE_URL}")
    private String WHATSAPP_API_BASE_URL;

    private final RestClient restClient;
    private final String WHATSAPP_API_TOKEN;

    public WhatsAppApiService(
            RestClient.Builder restClientBuilder,
            @Value("${WHATSAPP_API_BASE_URL}") String whatsappApiBaseUrl,
            @Value("${WHATSAPP_API_TOKEN}") String whatsappApiToken) {

        // Asignar el token de acceso
        this.WHATSAPP_API_TOKEN = whatsappApiToken;

        // Inicializar RestClient con la URL base de Meta (Asegurando que el scheme se use aquí)
        this.restClient = restClientBuilder
                .baseUrl(whatsappApiBaseUrl) // El valor COMPLETO (https://...)
                .build();
    }

    /**
     * Envía un mensaje de texto simple a través de la API de WhatsApp Cloud.
     * @param recipientPhoneNumber Número de teléfono de destino (ej. +54911xxxxxxx).
     * @param message Texto del mensaje.
     * @return Mapa de respuesta de Meta que contiene el ID del mensaje.
     */
    public Map<String, String> sendTextMessage(String recipientPhoneNumber, String message) {

        // 1. Crear el Body JSON que espera la API de Meta
        // Nota: El 'type' y 'messaging_product' son fijos para la Cloud API.
        Map<String, Object> requestBody = Map.of(
                "messaging_product", "whatsapp",
                "to", recipientPhoneNumber,
                "type", "text",
                "text", Map.of("body", message)
        );

        log.info("Enviando mensaje de WhatsApp a: {}", recipientPhoneNumber);

        try {
            // 2. Realizar la solicitud POST a la API de Meta
            Map<String, Object> response = restClient.post()
                    // El endpoint real de Meta es siempre el mismo: /messages
                    .uri("/messages")
                    .header("Authorization", "Bearer " + WHATSAPP_API_TOKEN)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});

            // 3. Extraer el ID del mensaje para el seguimiento en la DB
            if (response != null && response.containsKey("messages")) {
                @SuppressWarnings("unchecked")
                List<Map<String, String>> messages = (List<Map<String, String>>) response.get("messages");

                if (!messages.isEmpty()) {
                    String messageId = messages.get(0).get("id");
                    log.info("Mensaje enviado exitosamente. ID de Meta: {}", messageId);

                    return Map.of("external_message_id", messageId);
                }
            }

            return Collections.emptyMap();

        } catch (Exception e) {
            log.error("Error al enviar mensaje a WhatsApp: {}", e.getMessage(), e);
            throw new RuntimeException("Fallo en la comunicación con la API de WhatsApp.", e);
        }
    }

    public void processInboundWebhook(Map<String, Object> payload) {

        log.info("📢 Webhook recibido. Iniciando procesamiento de mensaje INBOUND...");

        // Aquí iría la lógica real:
        // 1. Parsear el payload para encontrar el mensaje, el remitente y la conversación.
        // 2. Extraer el texto o el tipo de mensaje (media, text, etc.).
        // 3. Usar el MessageService para guardar el mensaje en la DB.
        // 4. Actualizar el estado de la conversación (ej., unreadCount++).

        // Por ahora, solo registramos el contenido del payload para fines de prueba.
        log.debug("Contenido del Payload: {}", payload);

        // Nota: Aunque el método no haga nada complejo ahora, debe existir
        // para que la llamada en el controlador compile.
    }

}