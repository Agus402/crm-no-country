package com.nocountry.backend.dto;

import com.nocountry.backend.enums.TriggerEvent;
import java.time.LocalDateTime;

public record AutomationRuleDTO(

                Long id,
                String name,
                TriggerEvent triggerEvent,
                String triggerValue,
                Integer waitDays,
                Integer waitHours,
                String actions,
                Boolean isActive,
                Long createdById,
                LocalDateTime createdAt

) {
}