package com.nocountry.backend.dto;

import java.time.LocalDateTime;

public record SmartReminderDTO(
        Long id,
        String text,
        String time,
        String type,
        Long leadId,
        String leadName,
        LocalDateTime createdAt
) {}

