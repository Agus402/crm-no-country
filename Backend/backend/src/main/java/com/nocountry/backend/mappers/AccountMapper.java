// AccountMapper.java (Nueva Interfaz MapStruct)

package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.AccountDTO;
import com.nocountry.backend.entity.Account;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AccountMapper {

    // Método principal: IGNORAMOS el campo 'owner' para romper el ciclo User -> Account
    @Mapping(target = "owner", ignore = true)
    AccountDTO toDTO(Account entity);

    List<AccountDTO> toDTOList(List<Account> entities);

    Account toEntity(AccountDTO dto);
}