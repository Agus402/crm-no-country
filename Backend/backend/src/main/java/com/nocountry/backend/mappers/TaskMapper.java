package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.CrmLeadDTO;
import com.nocountry.backend.dto.TaskDTO;
import com.nocountry.backend.dto.UserDTO;
import com.nocountry.backend.entity.Task;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TaskMapper {

    private final UserMapper userMapper;
    private final CrmLeadMapper crmLeadMapper;

    public TaskDTO toDTO(Task task) {
        if (task == null) {
            return null;
        }

        // Mapear el usuario sin el account para evitar bucles
        UserDTO assignedToDTO = userMapper.toDTO(task.getAssignedTo());

        // Mapear el contacto
        CrmLeadDTO crmLeadDTO = crmLeadMapper.toDTO(task.getCrmLead());

        return new TaskDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getTaskType(),
                task.getDueDate(),
                task.isCompleted(),
                task.getIsAutomated() != null ? task.getIsAutomated() : false,
                task.getCreatedAt(),
                task.getPriority(),
                crmLeadDTO,
                assignedToDTO
        );
    }

    public List<TaskDTO> toDTOList(List<Task> tasks) {
        if (tasks == null) {
            return List.of();
        }
        return tasks.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
