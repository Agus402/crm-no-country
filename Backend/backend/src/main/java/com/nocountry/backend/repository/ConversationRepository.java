package com.nocountry.backend.repository;

import com.nocountry.backend.entity.Conversation;
import com.nocountry.backend.enums.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Busca una conversación por Lead ID y Canal.
     * Utilizado para encontrar la conversación de WhatsApp asociada a un Lead.
     */
    @Query("SELECT c FROM Conversation c WHERE c.crm_lead.id = :leadId AND c.channel = :channel")
    Optional<Conversation> findByLeadIdAndChannel(@Param("leadId") Long leadId, @Param("channel") Channel channel);
}
