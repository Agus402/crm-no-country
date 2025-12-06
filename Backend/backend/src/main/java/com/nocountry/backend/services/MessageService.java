package com.nocountry.backend.services;

import com.nocountry.backend.dto.CreateMessageDTO;
import com.nocountry.backend.dto.MessageDTO;
import com.nocountry.backend.entity.Conversation;
import com.nocountry.backend.entity.Message;
import com.nocountry.backend.enums.Channel;
import com.nocountry.backend.enums.Direction;
import com.nocountry.backend.mappers.MessageMapper;
import com.nocountry.backend.repository.ConversationRepository;
import com.nocountry.backend.repository.MessageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.nocountry.backend.services.whatsapp.WhatsAppApiService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final WhatsAppApiService whatsAppApiService;
    private final MessageRepository messageRepository;
    private final MessageMapper messageMapper;
    private final ConversationRepository conversationRepository;

    @Transactional
    public MessageDTO create(CreateMessageDTO dto) {

        Conversation conversation = conversationRepository.findById(dto.conversationId())
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        Message message = messageMapper.toEntity(dto);

        message.setConversation(conversation);
        message.setSentAt(LocalDateTime.now());

        if (dto.messageDirection() == Direction.OUTBOUND) {

            // Asumo que Conversation tiene el campo 'channel' y que el Lead tiene el 'phone'
            if (conversation.getChannel() == Channel.WHATSAPP) {

                // CRÍTICO: Llama a la API externa de Meta
                String externalId = whatsAppApiService.sendMessage(
                        conversation.getCrm_lead().getPhone(), // Obtiene el teléfono del Lead asociado a la conversación
                        dto.content()
                );

                // CRÍTICO: Almacena el ID externo devuelto por Meta
                message.setExternalMessageId(externalId);
            }
            // else if (conversation.getChannel() == Channel.EMAIL) { /* Lógica de Email Service */ }
        }

        Message savedMessage = messageRepository.save(message);

        conversation.setLastMessageAt(message.getSentAt());
        conversation.setLastMessageText(message.getContent());
        conversationRepository.save(conversation);

        return messageMapper.toDTO(savedMessage);
    }

}
