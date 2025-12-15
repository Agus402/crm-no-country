package com.nocountry.backend.dto;

import com.nocountry.backend.enums.Direction;
import com.nocountry.backend.enums.MessageType;
import com.nocountry.backend.enums.SenderType;

import java.time.LocalDateTime;

public record MessageDTO(

        Long id,

        ConversationDTO conversation,

        SenderType senderType,

        Long senderLeadId,

        Direction messageDirection,

        MessageType messageType,

        String content,

        String mediaUrl,

        String mediaFileName,

        String mediaType,

        String mediaCaption,

        String externalMessageId,

        Long templateId,

        LocalDateTime sentAt,

        // Reply-to message support
        Long replyToMessageId,

        ReplyMessageDTO replyToMessage

) {
}
