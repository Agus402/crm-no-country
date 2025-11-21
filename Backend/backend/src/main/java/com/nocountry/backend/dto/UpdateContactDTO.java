package com.nocountry.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;

public record UpdateContactDTO(
        @NotBlank String name,
        @Email String email,
        String phone,
        String stage,
        Set<Long> tagIds
) {}
