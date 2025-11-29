package com.nocountry.backend.dto;

import com.nocountry.backend.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CreateUpdateTaskDTO(

        @NotBlank(message = "El título es obligatorio")
        String title,

        String description,

        @NotNull(message = "La fecha de vencimiento es obligatoria")
        LocalDateTime dueDate,

        @NotNull(message = "La prioridad es obligatoria")
        Priority priority,

        // ID del contacto al que se asigna la tarea (FK)
        @NotNull(message = "El ID del contacto es obligatorio")
        Long crmLead_Id

        // El assignedTo (agente) se obtiene del JWT en el Controller
) {}