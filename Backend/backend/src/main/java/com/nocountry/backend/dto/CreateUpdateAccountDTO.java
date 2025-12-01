package com.nocountry.backend.dto;

import jakarta.validation.constraints.NotBlank;
import org.springframework.lang.Nullable;

public record CreateUpdateAccountDTO(

        @NotBlank(message = "El nombre de la cuenta es obligatorio.")
        String name,

        @Nullable String industry,
        @Nullable String website,
        @Nullable String phone,
        @Nullable String address,
        @Nullable String timeZone,
        @Nullable String dateFormat

) {}