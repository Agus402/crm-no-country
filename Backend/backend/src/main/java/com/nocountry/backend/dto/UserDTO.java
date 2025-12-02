package com.nocountry.backend.dto;

import com.nocountry.backend.enums.Role;

import java.time.LocalDateTime;

// DTO de Respuesta (Salida hacia el Frontend)
public record UserDTO(

        Long id,

        String name,

        String email,

        Role role,

        boolean active,

        AccountDTO account,

        LocalDateTime createdAt
) {}
