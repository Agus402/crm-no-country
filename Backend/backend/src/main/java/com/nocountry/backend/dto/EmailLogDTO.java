package com.nocountry.backend.dto;

import com.nocountry.backend.enums.EmailStatus;

import java.time.LocalDateTime;

public record EmailLogDTO(
        Long id,
        Long leadId,
        String subject,
        String body,
        String providerMessageId,
        EmailStatus status,
        LocalDateTime createdAt
) {}
