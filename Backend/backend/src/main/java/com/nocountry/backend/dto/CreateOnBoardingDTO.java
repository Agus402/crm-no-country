package com.nocountry.backend.dto;

import io.micrometer.common.lang.Nullable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateOnBoardingDTO(

        // Datos del Usuario Administrador (User)
        @NotBlank(message = "El nombre de la empresa es obligatorio")
        String companyName,

        @Nullable
        String industry, // Opcional

        @Nullable
        String website,

        @Nullable
        String phone,

        @Nullable
        String address,

        // Datos del Usuario Administrador (User)
        @NotBlank(message = "El nombre del usuario es obligatorio")
        String userName,

        @Email(message = "Email inválido")
        @NotBlank(message = "El email es obligatorio")
        String userEmail,

        @NotBlank(message = "La contraseña es obligatoria")
        String password

) {
}
