package com.nocountry.backend.dto;

import com.nocountry.backend.enums.Channel;
import com.nocountry.backend.enums.ConversationStatus;

public record CreateConversationDTO(

        Long leadId,

        Long assignedUserId,

        Channel channel,

        ConversationStatus status
) {}