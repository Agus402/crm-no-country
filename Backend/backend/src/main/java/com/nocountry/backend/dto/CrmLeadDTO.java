package com.nocountry.backend.dto;

import com.nocountry.backend.enums.Channel;
import com.nocountry.backend.enums.Stage;

import java.time.LocalDateTime;
import java.util.Set;

public record CrmLeadDTO(
        Long id,
        String name,
        String email,
        String phone,
        Stage stage,
        Channel channel,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Set<Long> tagIds,
        AccountDTO account

) {}
