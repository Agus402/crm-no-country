package com.nocountry.backend.repository;

import com.nocountry.backend.entity.EmailTemplate;
import com.nocountry.backend.enums.EmailTemplateType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {

    boolean existsByNameIgnoreCase(String name);
    Optional<EmailTemplate> findByType(EmailTemplateType type);

}