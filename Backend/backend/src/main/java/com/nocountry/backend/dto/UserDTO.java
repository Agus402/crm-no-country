package com.nocountry.backend.dto;

import com.nocountry.backend.enums.Role;

import java.time.LocalDateTime;

public record UserDTO(

        Long id,

        String name,

        String email,

        Role role,

        boolean active,

        AccountDTO account,

        LocalDateTime createdAt
) {}
