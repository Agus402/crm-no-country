package com.nocountry.backend.services.whatsapp;

import com.nocountry.backend.dto.WhatsAppOutboundRequestDTO;
import com.nocountry.backend.dto.WhatsAppTextComponentDTO;
import com.nocountry.backend.exceptions.WhatsAppApiException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient; // Alternativa a WebClient/RestTemplate

import java.util.List;
import java.util.Map;

@Service
public class WhatsAppApiService {

    // 1. Configuración desde application.properties (ejemplo)
    @Value("${whatsapp.api.base-url}")
    private String apiUrl; // Ej: https://graph.facebook.com/v19.0/PHONE_NUMBER_ID

    @Value("${whatsapp.api.token}")
    private String accessToken; // Token de Acceso Permanente

    private final RestClient restClient;

    // Usaremos un constructor para inicializar el RestClient con la base URL
    public WhatsAppApiService(@Value("${whatsapp.api.base-url}") String apiUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Envía un mensaje de texto OUTBOUND a un Lead específico a través de la API de WhatsApp Cloud.
     *
     * @param phoneNumber El número del destinatario (ej: "54911xxxx").
     * @param content     El texto del mensaje.
     * @return El ID de mensaje externo devuelto por Meta.
     */
    public String sendMessage(String phoneNumber, String content) {

        WhatsAppOutboundRequestDTO requestBody = new WhatsAppOutboundRequestDTO(
                "individual",
                phoneNumber,
                "text",
                new WhatsAppTextComponentDTO(content)
        );

        try {
            // Realiza la llamada HTTP POST a la API
            Map<String, Object> response = restClient.post()
                    .uri("/messages") // Endpoint relativo
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .body(requestBody)
                    .retrieve()
                    .toEntity(Map.class) // Espera una respuesta JSON como Map
                    .getBody();

            // La API de WhatsApp devuelve una estructura como: {"messages": [{"id": "wamid.xxxxxxxxxx"}]}
            if (response != null && response.containsKey("messages")) {
                List<Map<String, String>> messages = (List<Map<String, String>>) response.get("messages");
                if (!messages.isEmpty() && messages.get(0).containsKey("id")) {
                    return messages.get(0).get("id"); // Devuelve el externalMessageId
                }
            }

            throw new WhatsAppApiException("Respuesta de API de WhatsApp inválida o vacía.");

        } catch (Exception e) {
            // Manejo de errores específicos, ej: token inválido, número no existe.
            throw new WhatsAppApiException("Error al enviar mensaje a WhatsApp: " + e.getMessage(), e);
        }
    }

    /**
     * Método Placeholder para la RECEPCIÓN (Webhook).
     * Esta lógica será llamada por el WebhookController para procesar la data entrante.
     *
     * @param webhookData El JSON que llega del webhook de Meta.
     */
    public void processInboundWebhook(Map<String, Object> webhookData) {

        // --- 1. Basic Structure Validation ---
        if (webhookData == null || !webhookData.containsKey("entry")) {
            System.err.println("Webhook data is malformed or empty.");
            return;
        }

        // --- 2. Extract Message Content (Simplified) ---
        // NOTE: Real-world parsing is complex due to Meta's deep JSON structure (entry[0].changes[0].value.messages[0])

        // Attempt to extract core message data (requires deep casting, simplified here for logic clarity)
        Map<String, Object> messageData = extractMessageData(webhookData);

        if (messageData == null || !messageData.containsKey("from")) {
            System.err.println("Could not extract message details or 'from' field.");
            return;
        }

        String sourceNumber = (String) messageData.get("from");
        String messageContent = getMessageContent(messageData); // Extracts "text" or media caption/URL
        String externalId = (String) messageData.get("id"); // WhatsApp Message ID

        // --- 3. Delegate to Internal CRM Logic (Using MessageService/CrmLeadService) ---

        // We need a way to integrate this data into the CRM.
        // In a real application, we would inject a specialized component (e.g., InboundProcessorService)
        // to handle database interactions (lookup lead, update conversation, save message).

        // Simulate calling the CRM business logic:
        // inboundProcessorService.handleIncomingWhatsAppMessage(sourceNumber, messageContent, externalId);

        System.out.println("✅ Inbound message processed. Source: " + sourceNumber);
    }

    // Helper method (Simplified extraction logic - would be complex in reality)
    private Map<String, Object> extractMessageData(Map<String, Object> payload) {
        try {
            // 1. Obtener la lista 'entry'
            List<Map<String, Object>> entries = (List<Map<String, Object>>) payload.get("entry");
            if (entries == null || entries.isEmpty()) return null;

            Map<String, Object> firstEntry = entries.get(0);

            // 2. Obtener la lista 'changes' (entry[0].changes)
            List<Map<String, Object>> changes = (List<Map<String, Object>>) firstEntry.get("changes");
            if (changes == null || changes.isEmpty()) return null;

            Map<String, Object> firstChange = changes.get(0);

            // 3. Obtener el objeto 'value' (entry[0].changes[0].value)
            Map<String, Object> value = (Map<String, Object>) firstChange.get("value");
            if (value == null || !value.containsKey("messages")) return null;

            // 4. Obtener la lista 'messages' y devolver el primer mensaje (messages[0])
            List<Map<String, Object>> messages = (List<Map<String, Object>>) value.get("messages");
            if (messages == null || messages.isEmpty()) return null;

            return messages.get(0);

        } catch (ClassCastException e) {
            // Esto indica que la estructura JSON fue inesperada o faltaba un elemento clave.
            System.err.println("Error de parseo en el webhook de WhatsApp (ClassCastException): " + e.getMessage());
            return null;
        } catch (Exception e) {
            // Manejar otros errores, como NullPointerException si un .get() falla.
            System.err.println("Error inesperado al extraer el mensaje del webhook: " + e.getMessage());
            return null;
        }
    }

    // Helper method to get the actual text content
    private String getMessageContent(Map<String, Object> messageData) {
        if ("text".equals(messageData.get("type"))) {
            Map<String, String> textObject = (Map<String, String>) messageData.get("text");
            return textObject.get("body");
        }
        // Logic for handling image/media/template messages would go here
        return "[Media/Other Content Received]";
    }

}
