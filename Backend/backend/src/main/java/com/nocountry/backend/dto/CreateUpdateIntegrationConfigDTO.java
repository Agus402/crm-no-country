package com.nocountry.backend.dto;

import com.nocountry.backend.enums.IntegrationType;
import jakarta.validation.constraints.NotNull;

public record CreateUpdateIntegrationConfigDTO (

        @NotNull(message = "Integration type is required.")
        IntegrationType integrationType,

        @NotNull(message = "Account ID is required.")
        Long accountId,

        String credentials,

        @NotNull(message = "Connection status is required.")
        Boolean isConnected
) {}
