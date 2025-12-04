package com.nocountry.backend.dto;

import com.nocountry.backend.enums.IntegrationType;

import java.time.LocalDateTime;

public record IntegrationConfigDTO(

        Long id,

        IntegrationType integrationType,

        Long accountId,

        String credentials,

        Boolean isConnected,

        LocalDateTime createdAt
) {}
