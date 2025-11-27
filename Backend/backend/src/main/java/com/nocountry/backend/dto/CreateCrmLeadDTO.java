package com.nocountry.backend.dto;

import java.util.Set;

import com.nocountry.backend.enums.Channel;
import com.nocountry.backend.enums.Stage;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateCrmLeadDTO(
        @NotBlank String name,
        @Email String email,
        String phone,
        Stage stage,
        Channel channel,
        Set<Long> tagIds

) {}
