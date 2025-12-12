package com.nocountry.backend.services;

import com.nocountry.backend.dto.ConversationDTO;
import com.nocountry.backend.dto.CreateConversationDTO;
import com.nocountry.backend.dto.MessageDTO;
import com.nocountry.backend.entity.Conversation;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.mappers.ConversationMapper;
import com.nocountry.backend.mappers.MessageMapper;
import com.nocountry.backend.repository.ConversationRepository;
import com.nocountry.backend.repository.CrmLeadRepository;
import com.nocountry.backend.repository.MessageRepository;
import com.nocountry.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final CrmLeadRepository crmLeadRepository;
    private final ConversationMapper conversationMapper;
    private final MessageMapper messageMapper;
    private final UserRepository userRepository;

    // --- Messages ---
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

    // --- CREATE (POST) ---
    public ConversationDTO createConversation(CreateConversationDTO dto) {

        // 1. Obtener entidades relacionadas (Lead y User)
        CrmLead lead = crmLeadRepository.findById(dto.leadId())
                .orElseThrow(() -> new RuntimeException("Lead no encontrado: " + dto.leadId()));

        User assignedUser = userRepository.findById(dto.assignedUserId())
                .orElseThrow(() -> new RuntimeException("Usuario asignado no encontrado: " + dto.assignedUserId()));

        // 2. Mapear DTO a Entidad
        Conversation conversation = conversationMapper.toEntity(dto);
        conversation.setCrm_lead(lead);
        conversation.setAssignedUser(assignedUser);
        conversation.setStartedAt(LocalDateTime.now());

        // 3. Guardar y mapear a DTO de respuesta
        Conversation savedConversation = conversationRepository.save(conversation);
        return conversationMapper.toDTO(savedConversation);
    }

    // --- READ ALL (GET) ---
    public List<ConversationDTO> findAllConversations() {
        return conversationRepository.findAll().stream()
                .map(conversationMapper::toDTO)
                .collect(Collectors.toList());
    }

    // --- READ BY ID (GET) ---
    public ConversationDTO findConversationById(Long id) {
        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada: " + id));
        return conversationMapper.toDTO(conversation);
    }

    // --- DELETE (DELETE/Cierre) ---
    public void deleteConversation(Long id) {
        // Para CRMs, generalmente se cambia el estado a CLOSED o ARCHIVED en lugar de
        // eliminar
        // Conversation conversation = conversationRepository.findById(id)
        // .orElseThrow(() -> new RuntimeException("Conversación no encontrada: " +
        // id));
        // conversation.setStatus(ConversationStatus.CLOSED);
        // conversationRepository.save(conversation);

        // Por ahora, simplemente eliminamos (o mantienes la lógica de cierre)
        if (!conversationRepository.existsById(id)) {
            throw new RuntimeException("Conversación no encontrada: " + id);
        }
        conversationRepository.deleteById(id);
    }

    // --- MARK AS READ (POST) ---
    public void markAsRead(Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada: " + conversationId));
        conversation.setUnreadCount(0);
        conversationRepository.save(conversation);
    }
}
