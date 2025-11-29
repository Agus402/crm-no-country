package com.nocountry.backend.dto;

import java.time.LocalDateTime;

public record AccountDTO(

        Long id,

        String name,

        String industry,

        String website,

        String phone,

        String address,

        String timeZone,

        String dateFormat,

        Boolean isActive,

        LocalDateTime createdAt,

        UserDTO owner

) {}
