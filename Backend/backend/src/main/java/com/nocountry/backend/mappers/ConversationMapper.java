package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.ConversationDTO;
import com.nocountry.backend.dto.CreateConversationDTO;
import com.nocountry.backend.entity.Conversation;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.Mapping;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {CrmLeadMapper.class, UserMapper.class})
public interface ConversationMapper {

    // Método principal: Convierte la entidad Conversation a ConversationDTO
    ConversationDTO toDTO(Conversation entity);

    @Mapping(source = "leadId", target = "crm_lead.id")
    @Mapping(source = "assignedUserId", target = "assignedUser.id")
    Conversation toEntity(CreateConversationDTO dto);

    // Si tu ConversationDTO tiene relaciones bidireccionales, necesitarás un método Summary aquí.
}