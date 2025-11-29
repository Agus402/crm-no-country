package com.nocountry.backend.dto;

import com.nocountry.backend.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// DTO de Creación/Actualización (Entrada desde el Controller)
public record CreateUpdateUserDTO(

        @NotBlank(message = "El nombre es obligatorio")
        String name,

        @Email(message = "Debe ser un formato de correo válido")
        @NotBlank(message = "El email es obligatorio")
        String email,

        // Campo opcional: Usado solo para actualización o si se crea manualmente
        String password,

        @NotNull(message = "El rol es obligatorio")
        Role role,

        // ID de la cuenta a la que pertenece el usuario
        Long accountId
) {}
