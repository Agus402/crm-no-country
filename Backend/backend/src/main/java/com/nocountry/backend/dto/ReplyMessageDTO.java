package com.nocountry.backend.dto;

import com.nocountry.backend.enums.MessageType;
import com.nocountry.backend.enums.SenderType;

/**
 * Simplified DTO for quoted/reply messages to avoid circular references
 */
public record ReplyMessageDTO(
        Long id,
        SenderType senderType,
        MessageType messageType,
        String content,
        String mediaUrl,
        String mediaType) {
}
