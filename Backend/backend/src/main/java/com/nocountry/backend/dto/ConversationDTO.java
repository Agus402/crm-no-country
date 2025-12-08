package com.nocountry.backend.dto;

import com.nocountry.backend.enums.Direction;
import com.nocountry.backend.enums.ConversationStatus;

import java.time.LocalDateTime;

public record ConversationDTO(
        Long id,
        Long leadId,
        Long assignedUserId,
        String lastMessageText,
        Direction lastMessageDirection,
        Integer unreadCount,
        LocalDateTime startedAt,
        LocalDateTime lastMessageAt,
        ConversationStatus status
) {}
