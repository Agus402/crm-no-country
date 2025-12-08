package com.nocountry.backend.services.whatsapp;

import com.nocountry.backend.repository.ConversationRepository;
import com.nocountry.backend.repository.CrmLeadRepository;
import com.nocountry.backend.services.MessageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@Slf4j // Para usar logger.info/error
public class WhatsAppApiService {

    // URL base configurada en .env
    // (https://graph.facebook.com/v19.0/<PHONE_NUMBER_ID>)
    @Value("${WHATSAPP_API_BASE_URL}")
    private String WHATSAPP_API_BASE_URL;

    private final RestClient restClient;
    private final String WHATSAPP_API_TOKEN;
    private final CrmLeadRepository crmLeadRepository;
    private final ConversationRepository conversationRepository;
    private final MessageService messageService;

    public WhatsAppApiService(
            RestClient.Builder restClientBuilder,
            @Value("${WHATSAPP_API_BASE_URL}") String whatsappApiBaseUrl,
            @Value("${WHATSAPP_API_TOKEN}") String whatsappApiToken,
            CrmLeadRepository crmLeadRepository,
            ConversationRepository conversationRepository,
            @Lazy MessageService messageService) {

        // Asignar el token de acceso
        this.WHATSAPP_API_TOKEN = whatsappApiToken;

        // Asignar repositorios y servicios
        this.crmLeadRepository = crmLeadRepository;
        this.conversationRepository = conversationRepository;
        this.messageService = messageService;

        // Inicializar RestClient con la URL base de Meta (Asegurando que el scheme se
        // use aquí)
        this.restClient = restClientBuilder
                .baseUrl(whatsappApiBaseUrl) // El valor COMPLETO (https://...)
                .build();
    }

    /**
     * Envía un mensaje de texto simple a través de la API de WhatsApp Cloud.
     * 
     * @param recipientPhoneNumber Número de teléfono de destino (ej.
     *                             +54911xxxxxxx).
     * @param message              Texto del mensaje.
     * @return Mapa de respuesta de Meta que contiene el ID del mensaje.
     */
    public Map<String, String> sendTextMessage(String recipientPhoneNumber, String message) {

        // 1. Crear el Body JSON que espera la API de Meta
        // Nota: El 'type' y 'messaging_product' son fijos para la Cloud API.
        Map<String, Object> requestBody = Map.of(
                "messaging_product", "whatsapp",
                "to", recipientPhoneNumber,
                "type", "text",
                "text", Map.of("body", message));

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
                    .body(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });

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

        try {
            // 1. Parsear el payload usando los DTOs de WhatsApp
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String payloadJson = objectMapper.writeValueAsString(payload);
            com.nocountry.backend.dto.whatsapp.WhatsAppWebhookPayloadDTO webhookPayload = objectMapper
                    .readValue(payloadJson, com.nocountry.backend.dto.whatsapp.WhatsAppWebhookPayloadDTO.class);

            // 2. Validar que contiene mensajes
            if (webhookPayload.entry() == null || webhookPayload.entry().isEmpty()) {
                log.warn("Webhook sin entries. Ignorando.");
                return;
            }

            com.nocountry.backend.dto.whatsapp.WhatsAppEntryDTO entry = webhookPayload.entry().get(0);
            if (entry.changes() == null || entry.changes().isEmpty()) {
                log.warn("Entry sin changes. Ignorando.");
                return;
            }

            com.nocountry.backend.dto.whatsapp.WhatsAppChangeDTO change = entry.changes().get(0);
            com.nocountry.backend.dto.whatsapp.WhatsAppValueDTO value = change.value();

            if (value.messages() == null || value.messages().isEmpty()) {
                log.debug("Webhook sin mensajes (posiblemente status update). Ignorando.");
                return;
            }

            // 3. Extraer información del mensaje
            com.nocountry.backend.dto.whatsapp.WhatsAppInboundMessageDTO inboundMessage = value.messages().get(0);
            String fromPhone = inboundMessage.from();
            String messageId = inboundMessage.id();
            String timestamp = inboundMessage.timestamp();
            String messageType = inboundMessage.type();

            // Solo procesar mensajes de texto por ahora
            if (!"text".equals(messageType) || inboundMessage.text() == null) {
                log.info("Mensaje de tipo {} recibido. Solo se procesan mensajes de texto por ahora.", messageType);
                return;
            }

            String messageContent = inboundMessage.text().body();
            log.info("Mensaje de WhatsApp recibido de: {} | Contenido: {}", fromPhone, messageContent);

            // Normalizar número de teléfono argentino (quitar el "9" de celular)
            // WhatsApp envía: 5491122667629, pero guardamos: 541122667629
            String normalizedPhone = normalizeArgentinePhone(fromPhone);
            log.info("Número normalizado: {} -> {}", fromPhone, normalizedPhone);

            // Obtener nombre del perfil si está disponible
            final String contactName;
            if (value.contacts() != null && !value.contacts().isEmpty()) {
                com.nocountry.backend.dto.whatsapp.WhatsAppContactDTO contact = value.contacts().get(0);
                if (contact.profile() != null && contact.profile().name() != null) {
                    contactName = contact.profile().name();
                } else {
                    contactName = "Lead desde WhatsApp";
                }
            } else {
                contactName = "Lead desde WhatsApp";
            }

            // 4. Buscar o crear el Lead por número de teléfono normalizado
            com.nocountry.backend.entity.CrmLead lead = crmLeadRepository.findByPhone(normalizedPhone)
                    .orElseGet(() -> {
                        log.info("Lead no encontrado. Creando nuevo Lead para: {}", normalizedPhone);
                        // Generar email placeholder ya que es requerido en la base de datos
                        String placeholderEmail = normalizedPhone + "@whatsapp.generated";
                        com.nocountry.backend.entity.CrmLead newLead = com.nocountry.backend.entity.CrmLead.builder()
                                .phone(normalizedPhone)
                                .name(contactName)
                                .email(placeholderEmail)
                                .channel(com.nocountry.backend.enums.Channel.WHATSAPP)
                                .stage(com.nocountry.backend.enums.Stage.ACTIVE_LEAD)
                                .status("active")
                                .createdAt(java.time.LocalDateTime.now())
                                .updatedAt(java.time.LocalDateTime.now())
                                .deleted(false)
                                .build();
                        return crmLeadRepository.save(newLead);
                    });

            // 5. Buscar o crear la Conversación para ese Lead en el canal WhatsApp
            com.nocountry.backend.entity.Conversation conversation = conversationRepository
                    .findByLeadIdAndChannel(lead.getId(), com.nocountry.backend.enums.Channel.WHATSAPP)
                    .orElseGet(() -> {
                        log.info("Conversación no encontrada. Creando nueva conversación para Lead ID: {}",
                                lead.getId());
                        com.nocountry.backend.entity.Conversation newConversation = com.nocountry.backend.entity.Conversation
                                .builder()
                                .crm_lead(lead)
                                .channel(com.nocountry.backend.enums.Channel.WHATSAPP)
                                .status(com.nocountry.backend.enums.ConversationStatus.OPEN)
                                .startedAt(java.time.LocalDateTime.now())
                                .firstInboundAt(java.time.LocalDateTime.now())
                                .unreadCount(0)
                                .build();
                        return conversationRepository.save(newConversation);
                    });

            // 6. Guardar el mensaje usando MessageService
            java.time.LocalDateTime messageSentAt = java.time.LocalDateTime.ofEpochSecond(
                    Long.parseLong(timestamp), 0, java.time.ZoneOffset.UTC);

            messageService.saveInboundMessage(conversation, messageContent, messageId, messageSentAt);

            // 7. Actualizar la conversación (último mensaje, contador de no leídos)
            conversation.setLastMessageText(messageContent);
            conversation.setLastMessageAt(messageSentAt);
            conversation.setLastMessageDirection(com.nocountry.backend.enums.Direction.INBOUND);
            conversation.setUnreadCount(conversation.getUnreadCount() + 1);
            conversationRepository.save(conversation);

            log.info("✅ Mensaje INBOUND procesado exitosamente. Lead ID: {} | Conversation ID: {}",
                    lead.getId(), conversation.getId());

        } catch (Exception e) {
            log.error("❌ Error al procesar mensaje INBOUND del webhook: {}", e.getMessage(), e);
            // No lanzar excepción para evitar que Meta reenvíe el webhook
        }
    }

    /**
     * Normaliza números de teléfono argentinos quitando el "9" de celular.
     * WhatsApp envía números con formato 549XXXXXXXXXX, pero la mayoría de los
     * sistemas guardan 54XXXXXXXXXX (sin el 9).
     * 
     * Ejemplo: 5491122667629 -> 541122667629
     */
    private String normalizeArgentinePhone(String phone) {
        if (phone == null) {
            return null;
        }
        // Si el número empieza con "549" (Argentina + celular), quitar el "9"
        if (phone.startsWith("549") && phone.length() >= 13) {
            return "54" + phone.substring(3);
        }
        return phone;
    }

}