package com.nocountry.backend.dto;

import com.nocountry.backend.enums.Priority;
import com.nocountry.backend.enums.TaskType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CreateUpdateTaskDTO(

        @NotBlank(message = "Title is required")
        String title,

        String description,

        Boolean isAutomated,

        @NotNull(message = "Task type is required")
        TaskType taskType,

        @NotNull(message = "Due date is required")
        LocalDateTime dueDate,

        @NotNull(message = "Priority is required")
        Priority priority,

        // ID del contacto al que se asigna la tarea (FK)
        @NotNull(message = "Contact ID is required")
        Long crmLead_Id

) {}