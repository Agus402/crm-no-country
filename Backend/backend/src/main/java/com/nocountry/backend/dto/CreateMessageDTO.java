package com.nocountry.backend.dto;

import com.nocountry.backend.enums.SenderType;
import com.nocountry.backend.enums.Direction;
import com.nocountry.backend.enums.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.lang.Nullable;

public record CreateMessageDTO(

                @NotNull(message = "Conversation ID is required.") Long conversationId,

                @NotNull(message = "Sender type is required (USER or LEAD).") SenderType senderType,

                @Nullable Long senderLeadId,

                @NotNull(message = "Message direction is required.") Direction messageDirection,

                @NotNull(message = "Message type is required.") MessageType messageType,

                @NotBlank(message = "Message content is required.") String content,

                @Nullable String mediaUrl,

                @Nullable String mediaFileName,

                @Nullable String mediaCaption,

                @Nullable Long emailTemplateId) {
}