package com.nocountry.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateAcountDTO (

        @NotBlank(message = "Account name is required.")
        String name,
        String industry

) {}
