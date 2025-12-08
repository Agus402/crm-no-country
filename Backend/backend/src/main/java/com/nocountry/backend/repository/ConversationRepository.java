package com.nocountry.backend.repository;

import com.nocountry.backend.entity.Conversation;
import com.nocountry.backend.entity.CrmLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findFirstByLead(CrmLead lead);
}
