package com.nocountry.backend.dto;

import com.nocountry.backend.entity.IntegrationType;

import java.time.LocalDateTime;

public record IntegrationConfigDTO(

        Long id,

        IntegrationType integrationType,

        Long accountId,

        String credentials,

        Boolean isConnected,

        LocalDateTime createdAt
) {}
