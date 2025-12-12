package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.AutomationRuleDTO;
import com.nocountry.backend.dto.CreateUpdateAutomationRuleDTO;
import com.nocountry.backend.entity.AutomationRule;
import org.mapstruct.*;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AutomationRuleMapper {

    @Mapping(target = "createdById", source = "createdBy.id")
    AutomationRuleDTO toDTO(AutomationRule entity);

    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "leads", ignore = true)
    AutomationRule toEntity(CreateUpdateAutomationRuleDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "leads", ignore = true)
    void updateEntityFromDto(CreateUpdateAutomationRuleDTO dto, @MappingTarget AutomationRule entity);

}