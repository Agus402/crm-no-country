package com.nocountry.backend.services.whatsapp;

import com.nocountry.backend.dto.whatsapp.*;
import com.nocountry.backend.entity.Conversation;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.enums.*;
import com.nocountry.backend.repository.ConversationRepository;
import com.nocountry.backend.repository.CrmLeadRepository;
import com.nocountry.backend.services.MediaStorageService;
import com.nocountry.backend.services.MessageService;
import com.nocountry.backend.services.whatsapp.WhatsAppConfigService.WhatsAppCredentials;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class WhatsAppApiService {

    private final WhatsAppConfigService configService;
    private final CrmLeadRepository crmLeadRepository;
    private final ConversationRepository conversationRepository;
    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final MediaStorageService mediaStorageService;

    public WhatsAppApiService(
            WhatsAppConfigService configService,
            CrmLeadRepository crmLeadRepository,
            ConversationRepository conversationRepository,
            @Lazy MessageService messageService,
            SimpMessagingTemplate messagingTemplate,
            MediaStorageService mediaStorageService) {

        this.configService = configService;
        this.crmLeadRepository = crmLeadRepository;
        this.conversationRepository = conversationRepository;
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
        this.mediaStorageService = mediaStorageService;
    }

    /**
     * Crea un RestClient dinámico con la configuración actual de WhatsApp.
     */
    private RestClient createRestClient(WhatsAppCredentials credentials) {
        return RestClient.builder()
                .baseUrl(credentials.baseUrl())
                .build();
    }

    /**
     * Obtiene las credenciales o lanza excepción si no están configuradas.
     */
    private WhatsAppCredentials getCredentialsOrThrow() {
        return configService.getWhatsAppCredentials()
                .filter(WhatsAppCredentials::isValid)
                .orElseThrow(() -> new RuntimeException(
                        "WhatsApp Cloud API no está configurada. Por favor configure las credenciales en Configuración > Integraciones."));
    }

    /**
     * Envía un mensaje de texto simple a través de la API de WhatsApp Cloud.
     */
    public Map<String, String> sendTextMessage(String recipientPhoneNumber, String message) {

        WhatsAppCredentials credentials = getCredentialsOrThrow();
        RestClient restClient = createRestClient(credentials);

        Map<String, Object> requestBody = Map.of(
                "messaging_product", "whatsapp",
                "to", recipientPhoneNumber,
                "type", "text",
                "text", Map.of("body", message));

        log.info("Enviando mensaje de WhatsApp a: {}", recipientPhoneNumber);

        try {
            Map<String, Object> response = restClient.post()
                    .uri("/messages")
                    .header("Authorization", "Bearer " + credentials.apiToken())
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });

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
            // 1. Parse payload
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String payloadJson = objectMapper.writeValueAsString(payload);
            WhatsAppWebhookPayloadDTO webhookPayload = objectMapper.readValue(payloadJson,
                    WhatsAppWebhookPayloadDTO.class);

            // 2. Validate entries
            if (webhookPayload.entry() == null || webhookPayload.entry().isEmpty()) {
                log.warn("Webhook sin entries. Ignorando.");
                return;
            }

            WhatsAppEntryDTO entry = webhookPayload.entry().get(0);
            if (entry.changes() == null || entry.changes().isEmpty()) {
                log.warn("Entry sin changes. Ignorando.");
                return;
            }

            WhatsAppChangeDTO change = entry.changes().get(0);
            WhatsAppValueDTO value = change.value();

            if (value.messages() == null || value.messages().isEmpty()) {
                log.debug("Webhook sin mensajes (posiblemente status update). Ignorando.");
                return;
            }

            // 3. Extract message info
            WhatsAppInboundMessageDTO inboundMessage = value.messages().get(0);
            String fromPhone = inboundMessage.from();
            String externalMessageId = inboundMessage.id();
            String timestamp = inboundMessage.timestamp();
            String messageTypeStr = inboundMessage.type();

            log.info("📨 Mensaje recibido de: {} | Tipo: {}", fromPhone, messageTypeStr);

            // 4. Process message based on type
            MessageType messageType;
            String messageContent;
            String mediaUrl = null;
            String mediaFileName = null;
            String mimeType = null;
            String mediaCaption = null;

            WhatsAppCredentials credentials = null;

            switch (messageTypeStr) {
                case "text":
                    messageType = MessageType.TEXT;
                    messageContent = inboundMessage.text() != null ? inboundMessage.text().body() : "";
                    break;

                case "image":
                    messageType = MessageType.IMAGE;
                    if (inboundMessage.image() != null) {
                        credentials = getCredentialsOrThrow();
                        Map<String, String> imageResult = downloadAndStoreMedia(
                                inboundMessage.image().id(),
                                inboundMessage.image().mimeType(),
                                credentials.apiToken());
                        mediaUrl = imageResult.get("url");
                        mediaFileName = imageResult.get("filename");
                        mimeType = inboundMessage.image().mimeType();
                        mediaCaption = inboundMessage.image().caption();
                        messageContent = mediaCaption != null ? mediaCaption : "[Imagen]";
                    } else {
                        messageContent = "[Imagen no disponible]";
                    }
                    break;

                case "video":
                    messageType = MessageType.VIDEO;
                    if (inboundMessage.video() != null) {
                        credentials = getCredentialsOrThrow();
                        Map<String, String> videoResult = downloadAndStoreMedia(
                                inboundMessage.video().id(),
                                inboundMessage.video().mimeType(),
                                credentials.apiToken());
                        mediaUrl = videoResult.get("url");
                        mediaFileName = videoResult.get("filename");
                        mimeType = inboundMessage.video().mimeType();
                        mediaCaption = inboundMessage.video().caption();
                        messageContent = mediaCaption != null ? mediaCaption : "[Video]";
                    } else {
                        messageContent = "[Video no disponible]";
                    }
                    break;

                case "audio":
                    messageType = MessageType.AUDIO;
                    if (inboundMessage.audio() != null) {
                        credentials = getCredentialsOrThrow();
                        Map<String, String> audioResult = downloadAndStoreMedia(
                                inboundMessage.audio().id(),
                                inboundMessage.audio().mimeType(),
                                credentials.apiToken());
                        mediaUrl = audioResult.get("url");
                        mediaFileName = audioResult.get("filename");
                        mimeType = inboundMessage.audio().mimeType();
                        messageContent = "[Audio]";
                    } else {
                        messageContent = "[Audio no disponible]";
                    }
                    break;

                case "document":
                    messageType = MessageType.DOCUMENT;
                    if (inboundMessage.document() != null) {
                        credentials = getCredentialsOrThrow();
                        Map<String, String> docResult = downloadAndStoreMedia(
                                inboundMessage.document().id(),
                                inboundMessage.document().mimeType(),
                                credentials.apiToken());
                        mediaUrl = docResult.get("url");
                        mediaFileName = inboundMessage.document().filename();
                        mimeType = inboundMessage.document().mimeType();
                        mediaCaption = inboundMessage.document().caption();
                        messageContent = mediaFileName != null ? mediaFileName : "[Documento]";
                    } else {
                        messageContent = "[Documento no disponible]";
                    }
                    break;

                case "sticker":
                    messageType = MessageType.STICKER;
                    if (inboundMessage.sticker() != null) {
                        credentials = getCredentialsOrThrow();
                        Map<String, String> stickerResult = downloadAndStoreMedia(
                                inboundMessage.sticker().id(),
                                inboundMessage.sticker().mimeType(),
                                credentials.apiToken());
                        mediaUrl = stickerResult.get("url");
                        mediaFileName = stickerResult.get("filename");
                        mimeType = inboundMessage.sticker().mimeType();
                        messageContent = "[Sticker]";
                    } else {
                        messageContent = "[Sticker no disponible]";
                    }
                    break;

                default:
                    log.info("Tipo de mensaje no soportado: {}. Ignorando.", messageTypeStr);
                    return;
            }

            log.info("📝 Contenido procesado: {} | Media URL: {}", messageContent, mediaUrl);

            // 5. Normalize phone number
            String normalizedPhone = normalizeArgentinePhone(fromPhone);
            log.info("Número normalizado: {} -> {}", fromPhone, normalizedPhone);

            // 6. Get contact name
            final String contactName;
            if (value.contacts() != null && !value.contacts().isEmpty()) {
                WhatsAppContactDTO contact = value.contacts().get(0);
                if (contact.profile() != null && contact.profile().name() != null) {
                    contactName = contact.profile().name();
                } else {
                    contactName = "Lead desde WhatsApp";
                }
            } else {
                contactName = "Lead desde WhatsApp";
            }

            // 7. Find or create Lead
            CrmLead lead = crmLeadRepository.findByPhone(normalizedPhone)
                    .orElseGet(() -> {
                        log.info("Lead no encontrado. Creando nuevo Lead para: {}", normalizedPhone);
                        String placeholderEmail = normalizedPhone + "@whatsapp.generated";
                        CrmLead newLead = CrmLead.builder()
                                .phone(normalizedPhone)
                                .name(contactName)
                                .email(placeholderEmail)
                                .channel(Channel.WHATSAPP)
                                .stage(Stage.ACTIVE_LEAD)
                                .status("active")
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .deleted(false)
                                .build();
                        return crmLeadRepository.save(newLead);
                    });

            // 8. Find or create Conversation
            Conversation conversation = conversationRepository
                    .findByLeadIdAndChannel(lead.getId(), Channel.WHATSAPP)
                    .orElseGet(() -> {
                        log.info("Conversación no encontrada. Creando nueva conversación para Lead ID: {}",
                                lead.getId());
                        Conversation newConversation = Conversation.builder()
                                .crm_lead(lead)
                                .channel(Channel.WHATSAPP)
                                .status(ConversationStatus.OPEN)
                                .startedAt(LocalDateTime.now())
                                .firstInboundAt(LocalDateTime.now())
                                .unreadCount(0)
                                .build();
                        return conversationRepository.save(newConversation);
                    });

            // 9. Save inbound message with media
            LocalDateTime messageSentAt = LocalDateTime.ofEpochSecond(
                    Long.parseLong(timestamp), 0, ZoneOffset.UTC);

            messageService.saveInboundMediaMessage(
                    conversation,
                    messageContent,
                    externalMessageId,
                    messageSentAt,
                    messageType,
                    mediaUrl,
                    mediaFileName,
                    mimeType,
                    mediaCaption);

            // 10. Update conversation
            conversation.setLastMessageText(messageContent);
            conversation.setLastMessageAt(messageSentAt);
            conversation.setLastMessageDirection(Direction.INBOUND);
            conversation.setUnreadCount(conversation.getUnreadCount() + 1);
            conversationRepository.save(conversation);

            // 11. Send WebSocket notification
            try {
                com.nocountry.backend.dto.WebSocketMessageDTO notification = new com.nocountry.backend.dto.WebSocketMessageDTO(
                        "NEW_MESSAGE",
                        conversation.getId(),
                        null,
                        null);
                messagingTemplate.convertAndSend(
                        "/topic/conversations/" + conversation.getId(),
                        notification);
                messagingTemplate.convertAndSend(
                        "/topic/conversations",
                        notification);
                log.info("📡 Notificación WebSocket enviada para conversación {}", conversation.getId());
            } catch (Exception wsError) {
                log.warn("⚠️ Error al enviar notificación WebSocket: {}", wsError.getMessage());
            }

            log.info("✅ Mensaje INBOUND procesado exitosamente. Lead ID: {} | Conversation ID: {} | Type: {}",
                    lead.getId(), conversation.getId(), messageType);

        } catch (Exception e) {
            log.error("❌ Error al procesar mensaje INBOUND del webhook: {}", e.getMessage(), e);
        }
    }

    /**
     * Downloads media from WhatsApp and stores it locally.
     */
    private Map<String, String> downloadAndStoreMedia(String mediaId, String mimeType, String accessToken) {
        try {
            return mediaStorageService.downloadAndStoreWhatsAppMedia(mediaId, mimeType, accessToken);
        } catch (Exception e) {
            log.error("Error descargando media de WhatsApp: {} - {}", mediaId, e.getMessage());
            return Map.of(
                    "url", "",
                    "filename", "error_" + mediaId,
                    "mimeType", mimeType != null ? mimeType : "application/octet-stream");
        }
    }

    /**
     * Normaliza números de teléfono argentinos quitando el "9" de celular.
     */
    private String normalizeArgentinePhone(String phone) {
        if (phone == null) {
            return null;
        }
        if (phone.startsWith("549") && phone.length() >= 13) {
            return "54" + phone.substring(3);
        }
        return phone;
    }
}