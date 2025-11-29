package com.nocountry.backend.dto;

import com.nocountry.backend.entity.Priority;

import java.time.LocalDateTime;

public record TaskDTO(

        Long id,

        String title,

        String description,

        LocalDateTime dueDate,

        boolean completed,

        LocalDateTime createdAt,

        Priority priority,

        CrmLeadDTO crmLeadDTO,

        UserDTO assignedTo

         ) {}
