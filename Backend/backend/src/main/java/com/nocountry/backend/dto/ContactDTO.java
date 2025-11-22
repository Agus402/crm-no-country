package com.nocountry.backend.dto;

import java.time.LocalDateTime;
import java.util.Set;

public record ContactDTO(
        Long id,
        String name,
        String email,
        String phone,
        String stage,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime lastContactedAt,
        Set<Long> tagIds
) {}
