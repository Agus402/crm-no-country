package com.nocountry.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateAcountDTO (

        @NotBlank(message = "El nombre de la cuenta es obligatorio.")
        String name,
        String industry

) {}
