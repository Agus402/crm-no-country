package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.AccountDTO;
import com.nocountry.backend.dto.UserDTO;
import com.nocountry.backend.entity.Account;
import com.nocountry.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;


@Component
public class AccountMapper {

    public AccountDTO toDTO(Account account) {
        if (account == null) {
            return null;
        }

        // Mapeo manual del Owner para evitar bucles
        UserDTO ownerDTO = null;
        if (account.getOwner() != null) {
            ownerDTO = new UserDTO(
                    account.getOwner().getId(),
                    account.getOwner().getName(),
                    account.getOwner().getEmail(),
                    account.getOwner().getRole(),
                    account.getOwner().isActive(),
                    null, // <--- ROMPEMOS EL BUCLE AQUÍ: La cuenta dentro del usuario es NULL
                    account.getOwner().getCreatedAt()
            );
        }

        return new AccountDTO(
                account.getId(),
                account.getCompanyName(),
                account.getIndustry(),
                account.getWebsite(),
                account.getPhone(),
                account.getAddress(),
                account.getTimeZone(),
                account.getDateFormat(),
                true, // Asumiendo isActive si no está en la entidad, o account.getIsActive()
                account.getCreatedAt(),
                ownerDTO // Asignamos el owner mapeado manualmente
        );
    }

    public List<AccountDTO> toDTOList(List<Account> accounts) {
        if (accounts == null) {
            return List.of();
        }
        return accounts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Este método ya no se necesita porque lo hacemos inline en toDTO,
    // pero si lo quieres separado:
    public UserDTO toUserDTO(com.nocountry.backend.entity.User user) {
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
