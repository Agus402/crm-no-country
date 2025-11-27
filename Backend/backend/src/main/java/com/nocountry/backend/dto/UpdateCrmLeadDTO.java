package com.nocountry.backend.dto;

import com.nocountry.backend.enums.Channel;
import com.nocountry.backend.enums.Stage;
import jakarta.validation.constraints.Email;

import java.util.Set;

public record UpdateCrmLeadDTO(
        String name,
        @Email String email,
        String phone,
        Stage stage,
        Channel channel,
        Set<Long> tagIds

) {}
