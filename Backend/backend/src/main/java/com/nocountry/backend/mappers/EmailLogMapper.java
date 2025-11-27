package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.CreateEmailLogDTO;
import com.nocountry.backend.dto.EmailLogDTO;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.entity.EmailLog;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface EmailLogMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lead", source = "lead")
    @Mapping(target = "status", source = "dto.status")
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    EmailLog toEntity(CreateEmailLogDTO dto, CrmLead lead);

    @Mapping(target = "leadId", source = "lead.id")
    EmailLogDTO toDTO(EmailLog entity);
}