package com.nocountry.backend.services;

import com.nocountry.backend.dto.MessageDTO;
import com.nocountry.backend.entity.Conversation;
import com.nocountry.backend.mappers.MessageMapper;
import com.nocountry.backend.repository.ConversationRepository;
import com.nocountry.backend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final MessageMapper messageMapper;

    public List<MessageDTO> getConversationMessages(Long conversationId, Long userId) {

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.getAssignedUser().getId().equals(userId)) {
            throw new RuntimeException("You do not have permission to view this conversation.");
        }

        return messageRepository
                .findByConversationIdOrderBySentAtAsc(conversationId)
                .stream()
                .map(messageMapper::toDTO)
                .toList();
    }
}
