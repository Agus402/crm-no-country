package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.CrmLeadDTO;
import com.nocountry.backend.dto.TaskDTO;
import com.nocountry.backend.dto.UserDTO;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.entity.Task;
import com.nocountry.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TaskMapper {

    // 1. Mapeo Principal: Task -> TaskDTO
    // MapStruct busca automáticamente campos con el mismo nombre.
    // Especificamos métodos "Named" para las relaciones para controlar qué campos se llenan (y romper ciclos).
    @Mapping(target = "crmLeadDTO", source = "crmLead", qualifiedByName = "mapContactSummary")
    @Mapping(target = "assignedTo", source = "assignedTo", qualifiedByName = "mapUserSummary")
    @Mapping(target = "completed", source = "isCompleted")
    // Si tu campo en el DTO se llama 'crmLeadDTO' en vez de 'contact', usa: @Mapping(target = "crmLeadDTO", source = "contact", ...)
    TaskDTO toDTO(Task task);

    // 2. Mapeo de Lista
    List<TaskDTO> toDTOList(List<Task> tasks);

    // 3. Métodos Auxiliares para Resúmenes (Rompen ciclos)

    @Named("mapUserSummary")
    @Mapping(target = "account", ignore = true) // CRÍTICO: Ignorar la cuenta para evitar recursión (User -> Account -> Owner -> User...)
    @Mapping(target = "role", ignore = true)    // Opcional: Ignorar si solo quieres datos básicos
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    UserDTO toUserDTO(User user);

    @Named("mapContactSummary")
    @Mapping(target = "account", ignore = true) // CRÍTICO: Ignorar la cuenta del contacto
    @Mapping(target = "tagIds", ignore = true)    // Opcional: Ignorar tags en el resumen de la tarea
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "phone", ignore = true)
    @Mapping(target = "stage", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CrmLeadDTO toCrmLeadDTO(CrmLead crmLead);
}
