package com.nocountry.backend.repository;

import com.nocountry.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Busca todos los mensajes asociados a un ID de conversación específico.
     * La convención de nombres 'findByConversationId' funciona automáticamente
     * con la entidad Message que tiene la relación 'conversation'.
     */
    List<Message> findByConversationId(Long conversationId);
}