package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.CreateUpdateIntegrationConfigDTO;
import com.nocountry.backend.dto.IntegrationConfigDTO;
import com.nocountry.backend.entity.IntegrationConfig;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface IntegrationConfigMapper {

    @Mapping(target = "accountId", source = "account.id")
    IntegrationConfigDTO toDTO(IntegrationConfig entity);

    @Mapping(target = "account", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    IntegrationConfig toEntity(CreateUpdateIntegrationConfigDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "account", ignore = true)
    void updateEntityFromDto(CreateUpdateIntegrationConfigDTO dto, @MappingTarget IntegrationConfig entity);
}
