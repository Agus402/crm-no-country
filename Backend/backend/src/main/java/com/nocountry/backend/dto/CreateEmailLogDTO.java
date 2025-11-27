package com.nocountry.backend.dto;

import com.nocountry.backend.enums.EmailStatus;

public record CreateEmailLogDTO(
        Long leadId,
        String subject,
        String body,
        String providerMessageId,
        EmailStatus status
) {}
