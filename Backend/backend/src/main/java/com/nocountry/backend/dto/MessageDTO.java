package com.nocountry.backend.dto;

import com.nocountry.backend.enums.Direction;
import com.nocountry.backend.enums.MessageType;
import com.nocountry.backend.enums.SenderType;

import java.time.LocalDateTime;

public record MessageDTO(
        Long id,
        SenderType senderType,
        Long senderLeadId,
        Direction direction,
        MessageType messageType,
        String content,
        String mediaType,
        String mediaCaption,
        String externalMessageId,
        Long templateId,
        LocalDateTime sentAt
) {}