package com.nocountry.backend.dto;

import com.nocountry.backend.entity.TriggerEvent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.lang.Nullable;

public record CreateUpdateAutomationRuleDTO(

        @NotBlank(message = "El nombre de la regla es obligatorio.")
        String name,

        @NotNull(message = "El evento disparador es obligatorio.")
        TriggerEvent triggerEvent,

        // El valor del disparador puede ser nulo (ej: si el evento es genérico)
        @Nullable
        String triggerValue,

        // La acción se guarda como JSON String
        @NotBlank(message = "La definición de acciones (JSON) es obligatoria.")
        String actions,

        @NotNull(message = "El estado de actividad es obligatorio.")
        Boolean isActive

) {}