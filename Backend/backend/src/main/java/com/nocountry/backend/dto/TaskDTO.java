package com.nocountry.backend.dto;

import com.nocountry.backend.enums.Priority;
import com.nocountry.backend.enums.TaskType;

import java.time.LocalDateTime;

public record TaskDTO(

        Long id,

        String title,

        String description,

        TaskType taskType,

        LocalDateTime dueDate,

        boolean completed,

        Boolean isAutomated,

        LocalDateTime createdAt,

        Priority priority,

        CrmLeadDTO crmLead,

        UserDTO assignedTo

) {}
