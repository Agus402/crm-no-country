package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.AccountDTO;
import com.nocountry.backend.dto.UserDTO;
import com.nocountry.backend.entity.Account;
import com.nocountry.backend.entity.User;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    /**
     * Convierte un User a su DTO de respuesta completo (UserResponseDTO).
     * Incluye el detalle de la cuenta, pero SIN el dueño dentro de la cuenta.
     */
    public UserDTO toResponseDTO(User user) {
        if (user == null) {
            return null;
        }

        // Mapeo manual de la Cuenta para evitar bucles
        AccountDTO accountDTO = null;
        if (user.getAccount() != null) {
            accountDTO = new AccountDTO(
                    user.getAccount().getId(),
                    user.getAccount().getCompanyName(),
                    user.getAccount().getIndustry(),
                    user.getAccount().getWebsite(),
                    user.getAccount().getPhone(),
                    user.getAccount().getAddress(),
                    user.getAccount().getTimeZone(),
                    user.getAccount().getDateFormat(),
                    true, // Asumiendo isActive
                    user.getAccount().getCreatedAt(),
                    null // <--- ROMPEMOS EL BUCLE AQUÍ: El dueño dentro de la cuenta es NULL
            );
        }

        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(), // O isEnabled()
                accountDTO,      // Asignamos la cuenta mapeada (sin dueño)
                user.getCreatedAt()
        );
    }

    /**
     * Convierte una lista de usuarios a lista de DTOs.
     */
    public List<UserDTO> toResponseDTOList(List<User> users) {
        if (users == null) {
            return List.of();
        }
        return users.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // Si necesitas el método toDTO (para devolver UserDTO pequeño), agrégalo así:
    public UserDTO toDTO(User user) {
        if (user == null) return null;
        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                null, // Importante: null para romper el ciclo
                user.getCreatedAt()
        );
    }
}
