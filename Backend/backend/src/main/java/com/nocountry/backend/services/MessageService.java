package com.nocountry.backend.services;

import com.nocountry.backend.dto.MessageDTO;
import com.nocountry.backend.dto.CreateMessageDTO;
import com.nocountry.backend.entity.Conversation;
import com.nocountry.backend.entity.Message;
import com.nocountry.backend.enums.Channel;
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
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final WhatsAppApiService whatsAppApiService;
    private final MessageMapper messageMapper;

    // --- CREATE OUTBOUND MESSAGE (POST) ---
    @Transactional
    public MessageDTO createOutboundMessage(CreateMessageDTO dto) {

        Conversation conversation = conversationRepository.findById(dto.conversationId())
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada"));

        // 1. Guardar el mensaje en la DB con estado inicial
        Message message = messageMapper.toEntity(dto);
        message.setConversation(conversation);
        message.setSentAt(LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);

        // 2. Si el canal es WhatsApp, llamar a la API externa
        if (conversation.getChannel() == Channel.WHATSAPP) {

            String recipientPhoneNumber = conversation.getCrm_lead().getPhone();

            // Llamar a la API de Meta
            Map<String, String> metaResponse = whatsAppApiService.sendTextMessage(
                    recipientPhoneNumber,
                    dto.content());

            // 3. Actualizar el mensaje con el ID externo de Meta (para seguimiento)
            String externalId = metaResponse.get("external_message_id");
            savedMessage.setExternalMessageId(externalId);
            messageRepository.save(savedMessage);
        }

        // 4. Actualizar la conversación (último mensaje)
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
}