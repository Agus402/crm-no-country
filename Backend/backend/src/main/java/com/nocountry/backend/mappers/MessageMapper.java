package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.MessageDTO;
import com.nocountry.backend.dto.ReplyMessageDTO;
import com.nocountry.backend.dto.CreateMessageDTO;
import com.nocountry.backend.entity.Message;
import org.mapstruct.*;
import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = { ConversationMapper.class,
        EmailTemplateMapper.class })
public interface MessageMapper {

    @Mapping(target = "conversation", source = "conversation")
    @Mapping(target = "templateId", source = "emailTemplate.id")
    @Mapping(target = "replyToMessageId", source = "replyToMessage.id")
    @Mapping(target = "replyToMessage", source = "replyToMessage")
    MessageDTO toDTO(Message entity);

    // Map quoted message to simplified DTO
    ReplyMessageDTO toReplyDTO(Message entity);

    List<MessageDTO> toDTOList(List<Message> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "conversation", ignore = true)
    @Mapping(target = "emailTemplate", ignore = true)
    @Mapping(target = "sentAt", ignore = true)
    @Mapping(target = "externalMessageId", ignore = true)
    @Mapping(target = "senderLeadId", source = "senderLeadId")
    @Mapping(target = "mediaUrl", ignore = true)
    @Mapping(target = "mediaFileName", ignore = true)
    @Mapping(target = "mediaType", ignore = true)
    @Mapping(target = "mediaCaption", ignore = true)
    @Mapping(target = "replyToMessage", ignore = true)
    Message toEntity(CreateMessageDTO dto);

}
