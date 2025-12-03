package com.nocountry.backend.dto;

import com.nocountry.backend.enums.LeadHistoryAction;

import java.time.LocalDateTime;

public record LeadHistoryDTO(
        Long id,
        Long leadId,
        Long userId,
        LeadHistoryAction action,
        String attribute,
        String state,
        LocalDateTime createdAt
) {}
