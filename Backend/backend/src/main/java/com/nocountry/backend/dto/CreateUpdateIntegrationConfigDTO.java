package com.nocountry.backend.dto;

import com.nocountry.backend.entity.IntegrationType;
import jakarta.validation.constraints.NotNull;

public record CreateUpdateIntegrationConfigDTO (

        @NotNull(message = "El tipo de integración es obligatorio.")
        IntegrationType integrationType,

        @NotNull(message = "El ID de la cuenta es obligatorio.")
        Long accountId,

        String credentials,

        @NotNull(message = "El estado de conexión es obligatorio.")
        Boolean isConnected
) {}
