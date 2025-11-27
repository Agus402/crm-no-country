package com.nocountry.backend.repository;

import com.nocountry.backend.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findByLeadId(Long leadId);

}