// UserMapper.java (Nueva Interfaz MapStruct)

package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.UserDTO;
import com.nocountry.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        // ¡CRÍTICO! Usar el AccountMapper para resolver la relación anidada
        uses = {AccountMapper.class})
public interface UserMapper {

    // Mapeo estándar. MapStruct lo generará automáticamente.
    UserDTO toDTO(User user);

    // Lista
    List<UserDTO> toDTOList(List<User> users);
}