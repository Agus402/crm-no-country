package com.nocountry.backend.dto;

import java.util.Set;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateContactDTO(
        @NotBlank String name,
        @Email String email,
        String phone,
        String stage,
        Set<Long> tagIds
) {}
