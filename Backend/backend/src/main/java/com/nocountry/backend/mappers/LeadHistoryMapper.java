package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.LeadHistoryDTO;
import com.nocountry.backend.entity.LeadHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LeadHistoryMapper {

    @Mapping(source = "lead.id", target = "leadId")
    @Mapping(source = "user.id", target = "userId")
    LeadHistoryDTO toDTO(LeadHistory entity);
}
