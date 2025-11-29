package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.UpdateUserPreferencesDTO;
import com.nocountry.backend.dto.UserPreferencesDTO;
import com.nocountry.backend.entity.UserPreferences;
import org.mapstruct.*;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserPreferencesMapper {

    @Mapping(target = "userId", source = "user.id") // Mapea el ID de la clave foránea/primaria
    UserPreferencesDTO toDTO(UserPreferences entity);

    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "user", ignore = true)
    void updateEntityFromDto(UpdateUserPreferencesDTO dto, @MappingTarget UserPreferences entity);
}
