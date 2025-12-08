package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.MessageDTO;
import com.nocountry.backend.entity.Message;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {

    public MessageDTO toDTO(Message m) {
        return new MessageDTO(
                m.getId(),
                m.getSenderType(),
                m.getSenderLeadId(),
                m.getMessageDirection(),
                m.getMessageType(),
                m.getContent(),
                m.getMediaType(),
                m.getMediaCaption(),
                m.getExternalMessageId(),
                m.getEmailTemplate() != null ? m.getEmailTemplate().getId() : null,
                m.getSentAt()
        );
    }
}
