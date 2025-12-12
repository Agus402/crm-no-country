package com.nocountry.backend.repository;

import com.nocountry.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Busca todos los mensajes asociados a un ID de conversación específico,
     * ordenados por fecha de envío de forma ascendente.
     */
    List<Message> findByConversationIdOrderBySentAtAsc(Long conversationId);

    /**
     * Busca todos los mensajes asociados a un ID de conversación específico.
     * La convención de nombres 'findByConversationId' funciona automáticamente
     * con la entidad Message que tiene la relación 'conversation'.
     */
    List<Message> findByConversationId(Long conversationId);

    /**
     * Busca un mensaje por su ID externo (WhatsApp message_id).
     * Usado para encontrar mensajes citados en respuestas.
     */
    Optional<Message> findByExternalMessageId(String externalMessageId);
}
