package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.ConversationDTO;
import com.nocountry.backend.entity.Conversation;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.Mapping;

// Asegúrate de inyectar los mappers de las relaciones anidadas en ConversationDTO (ej: CrmLeadMapper)
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {CrmLeadMapper.class})
public interface ConversationMapper {

    // Método principal: Convierte la entidad Conversation a ConversationDTO
    ConversationDTO toDTO(Conversation entity);

    // Si tu ConversationDTO tiene relaciones bidireccionales, necesitarás un método Summary aquí.
}