package com.nocountry.backend.dto;

import com.nocountry.backend.enums.TriggerEvent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.lang.Nullable;

public record CreateUpdateAutomationRuleDTO(

        @NotBlank(message = "Rule name is required.")
        String name,

        @NotNull(message = "Trigger event is required.")
        TriggerEvent triggerEvent,

        @Nullable
        String triggerValue,

        @NotBlank(message = "Action definition (JSON) is required.")
        String actions,

        @NotNull(message = "Active status is required.")
        Boolean isActive

) {}