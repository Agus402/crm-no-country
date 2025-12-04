package com.nocountry.backend.repository;

import com.nocountry.backend.entity.LeadHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeadHistoryRepository extends JpaRepository<LeadHistory, Long> {

    List<LeadHistory> findByLeadIdOrderByCreatedAtDesc(Long leadId);
}
