package com.nocountry.backend.services;

import com.nocountry.backend.dto.MessageDTO;
import com.nocountry.backend.dto.CreateMessageDTO;
import com.nocountry.backend.entity.Conversation;
import com.nocountry.backend.entity.Message;
import com.nocountry.backend.enums.Channel;
import com.nocountry.backend.enums.Direction;
import com.nocountry.backend.mappers.MessageMapper;
import com.nocountry.backend.repository.ConversationRepository;
import com.nocountry.backend.repository.MessageRepository;
import com.nocountry.backend.services.whatsapp.WhatsAppApiService; // Asegúrate de tener esta clase
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final WhatsAppApiService whatsAppApiService;
    private final EmailService emailService;
    private final MessageMapper messageMapper;

    // --- CREATE OUTBOUND MESSAGE (POST) ---
    @Transactional
    public MessageDTO createOutboundMessage(CreateMessageDTO dto) {
        log.info("📨 Creating outbound message: type={}, mediaUrl={}, content={}",
                dto.messageType(), dto.mediaUrl(), dto.content());

        Conversation conversation = conversationRepository.findById(dto.conversationId())
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada"));

        // 1. Guardar el mensaje en la DB con estado inicial
        Message message = messageMapper.toEntity(dto);
        message.setConversation(conversation);
        message.setSentAt(LocalDateTime.now());

        // Set media fields if present
        if (dto.mediaUrl() != null) {
            message.setMediaUrl(dto.mediaUrl());
        }
        if (dto.mediaFileName() != null) {
            message.setMediaFileName(dto.mediaFileName());
        }
        if (dto.mediaCaption() != null) {
            message.setMediaCaption(dto.mediaCaption());
        }

        Message savedMessage = messageRepository.save(message);

        // 2. Si el canal es WhatsApp, llamar a la API externa
        if (conversation.getChannel() == Channel.WHATSAPP) {

            String recipientPhoneNumber = conversation.getCrm_lead().getPhone();
            Map<String, String> metaResponse;

            // Send based on message type
            if (dto.messageType() == com.nocountry.backend.enums.MessageType.TEXT) {
                metaResponse = whatsAppApiService.sendTextMessage(
                        recipientPhoneNumber,
                        dto.content());
            } else if (dto.mediaUrl() != null) {
                // Send media message (IMAGE, VIDEO, AUDIO, DOCUMENT)
                log.info("📎 Sending media to WhatsApp: type={}, url={}", dto.messageType(), dto.mediaUrl());
                metaResponse = whatsAppApiService.sendMediaMessage(
                        recipientPhoneNumber,
                        dto.mediaUrl(),
                        dto.messageType(),
                        dto.mediaCaption(),
                        dto.mediaFileName());
            } else {
                metaResponse = java.util.Collections.emptyMap();
            }

            // Update with external message ID if available
            String externalId = metaResponse.get("external_message_id");
            if (externalId != null) {
                savedMessage.setExternalMessageId(externalId);
                messageRepository.save(savedMessage);
            }
        } else if (conversation.getChannel() == Channel.EMAIL) {
            // 2b. Si el canal es Email, enviar el correo real
            String recipientEmail = conversation.getCrm_lead().getEmail();
            if (recipientEmail != null && !recipientEmail.isBlank()) {
                String subject = dto.subject() != null ? dto.subject() : "Mensaje del CRM";
                String htmlBody = dto.content();

                // Buscar el último mensaje INBOUND para obtener el Message-ID para threading
                String inReplyTo = null;
                String references = null;

                java.util.List<Message> conversationMessages = messageRepository
                        .findByConversationIdOrderBySentAtAsc(dto.conversationId());

                // Buscar el último mensaje entrante (del lead)
                for (int i = conversationMessages.size() - 1; i >= 0; i--) {
                    Message msg = conversationMessages.get(i);
                    if (msg.getMessageDirection() == Direction.INBOUND
                            && msg.getExternalMessageId() != null) {
                        inReplyTo = msg.getExternalMessageId();
                        // Construir References (todos los Message-IDs del thread)
                        StringBuilder refs = new StringBuilder();
                        for (Message m : conversationMessages) {
                            if (m.getExternalMessageId() != null && !m.getExternalMessageId().isBlank()) {
                                if (refs.length() > 0)
                                    refs.append(" ");
                                refs.append(m.getExternalMessageId());
                            }
                        }
                        references = refs.toString();
                        break;
                    }
                }

                try {
                    emailService.sendHtmlEmail(recipientEmail, subject, htmlBody, inReplyTo, references);
                } catch (Exception e) {
                    throw new RuntimeException("Error al enviar email: " + e.getMessage(), e);
                }
            } else {
                throw new RuntimeException("El lead no tiene email configurado");
            }
        }

        // 3. Actualizar la conversación (último mensaje)
        conversation.setLastMessageText(dto.content());
        conversation.setLastMessageAt(savedMessage.getSentAt());
        conversation.setLastMessageDirection(dto.messageDirection());
        conversationRepository.save(conversation);

        return messageMapper.toDTO(savedMessage);
    }

    // --- READ ALL BY CONVERSATION ID (GET) ---
    public List<MessageDTO> findMessagesByConversationId(Long conversationId) {
        List<Message> messages = messageRepository.findByConversationId(conversationId);

        return messages.stream()
                .map(messageMapper::toDTO)
                .collect(Collectors.toList());
    }

    // --- SAVE INBOUND MESSAGE (FROM WEBHOOK) ---
    @Transactional
    public MessageDTO saveInboundMessage(
            Conversation conversation,
            String content,
            String externalMessageId,
            LocalDateTime timestamp) {

        // Crear entidad Message para mensaje INBOUND
        Message message = Message.builder()
                .conversation(conversation)
                .senderType(com.nocountry.backend.enums.SenderType.LEAD)
                .senderLeadId(conversation.getCrm_lead().getId())
                .messageDirection(com.nocountry.backend.enums.Direction.INBOUND)
                .messageType(com.nocountry.backend.enums.MessageType.TEXT)
                .content(content)
                .externalMessageId(externalMessageId)
                .sentAt(timestamp)
                .build();

        Message savedMessage = messageRepository.save(message);

        return messageMapper.toDTO(savedMessage);
    }

    // --- SAVE INBOUND MEDIA MESSAGE (FROM WEBHOOK - WITH MEDIA SUPPORT) ---
    @Transactional
    public MessageDTO saveInboundMediaMessage(
            Conversation conversation,
            String content,
            String externalMessageId,
            LocalDateTime timestamp,
            com.nocountry.backend.enums.MessageType messageType,
            String mediaUrl,
            String mediaFileName,
            String mimeType,
            String mediaCaption) {

        Message message = Message.builder()
                .conversation(conversation)
                .senderType(com.nocountry.backend.enums.SenderType.LEAD)
                .senderLeadId(conversation.getCrm_lead().getId())
                .messageDirection(com.nocountry.backend.enums.Direction.INBOUND)
                .messageType(messageType)
                .content(content)
                .mediaUrl(mediaUrl)
                .mediaFileName(mediaFileName)
                .mediaType(mimeType)
                .mediaCaption(mediaCaption)
                .externalMessageId(externalMessageId)
                .sentAt(timestamp)
                .build();

        Message savedMessage = messageRepository.save(message);

        return messageMapper.toDTO(savedMessage);
    }
}