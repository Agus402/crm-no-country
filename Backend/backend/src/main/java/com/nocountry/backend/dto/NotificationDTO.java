package com.nocountry.backend.dto;

import com.nocountry.backend.enums.NotificationType;
import com.nocountry.backend.enums.NotificationEntityType;

import java.time.LocalDateTime;

public record NotificationDTO(
        Long id,
        Long userId,
        Long leadId,
        NotificationType type,
        String body,
        NotificationEntityType entityType,
        Long entityId,
        boolean isRead,
        LocalDateTime createdAt
) {}
