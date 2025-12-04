package com.nocountry.backend.dto;

import com.nocountry.backend.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// DTO de Creación/Actualización (Entrada desde el Controller)
public record CreateUpdateUserDTO(

        @NotBlank(message = "Name is required")
        String name,

        @Email(message = "Must be a valid email format")
        @NotBlank(message = "Email is required")
        String email,

        // Campo opcional: Usado solo para actualización o si se crea manualmente
        String password,

        @NotNull(message = "Role is required")
        Role role,

        // ID de la cuenta a la que pertenece el usuario
        Long accountId
) {}
