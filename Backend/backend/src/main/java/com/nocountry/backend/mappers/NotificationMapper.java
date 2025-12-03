package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.NotificationDTO;
import com.nocountry.backend.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "lead.id", target = "leadId")
    NotificationDTO toDTO(Notification entity);
}

