package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.CreateEmailTemplateDTO;
import com.nocountry.backend.dto.EmailTemplateDTO;
import com.nocountry.backend.dto.UpdateEmailTemplateDTO;
import com.nocountry.backend.entity.EmailTemplate;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EmailTemplateMapper {

    EmailTemplate toEntity(CreateEmailTemplateDTO dto);

    EmailTemplateDTO toDTO(EmailTemplate entity);

    void updateEntityFromDto(UpdateEmailTemplateDTO dto, @MappingTarget EmailTemplate entity);
}

