package com.nocountry.backend.dto;

import io.micrometer.common.lang.Nullable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateOnBoardingDTO(

        // Datos del Usuario Administrador (User)
        @NotBlank(message = "Company name is required")
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
        @NotBlank(message = "User name is required")
        String userName,

        @Email(message = "Invalid email")
        @NotBlank(message = "Email is required")
        String userEmail,

        @NotBlank(message = "Password is required")
        String password

) {
}
