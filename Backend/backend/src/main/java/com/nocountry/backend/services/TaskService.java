package com.nocountry.backend.services;

import com.nocountry.backend.dto.CreateUpdateTaskDTO;
import com.nocountry.backend.dto.TaskDTO;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.entity.Task;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.enums.NotificationType;
import com.nocountry.backend.mappers.TaskMapper;
import com.nocountry.backend.repository.CrmLeadRepository;
import com.nocountry.backend.repository.TaskRepository;
import com.nocountry.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CrmLeadRepository crmLeadRepository; // Asegúrate de importar el repo correcto
    private final TaskMapper taskMapper;
    private final NotificationService notificationService;

    @Transactional
    public TaskDTO findTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con ID: " + id));
        return taskMapper.toDTO(task);
    }

    @Transactional
    public List<TaskDTO> findTasksByAssignedUser(Long userId, boolean isCompleted) {
        // Busca tareas asignadas al usuario filtrando por estado
        List<Task> tasks = taskRepository.findByAssignedToIdAndIsCompleted(userId, isCompleted);
        return taskMapper.toDTOList(tasks);
    }

    @Transactional
    public List<TaskDTO> findTasksDueToday() {
        // Obtenemos todas las pendientes y filtramos en memoria por la fecha de hoy.
        // Esto evita problemas con la zona horaria en consultas JPQL simples.
        List<Task> allPending = taskRepository.findByIsCompleted(false);

        return allPending.stream()
                .filter(task -> task.getDueDate() != null &&
                        task.getDueDate().toLocalDate().isEqual(LocalDate.now()))
                .map(taskMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskDTO createTask(CreateUpdateTaskDTO taskDTO, Long assignedToId) {

        // 1. Validar existencia del usuario asignado
        User assignedTo = userRepository.findById(assignedToId)
                .orElseThrow(() -> new RuntimeException("Usuario asignado no encontrado con ID: " + assignedToId));

        // 2. Validar existencia del contacto asociado
        CrmLead crmLead = crmLeadRepository.findById(taskDTO.crmLead_Id())
                .orElseThrow(() -> new RuntimeException("Contacto no encontrado con ID: " + taskDTO.crmLead_Id()));

        // 3. Crear la entidad usando el Builder
        Task task = Task.builder()
                .title(taskDTO.title())
                .description(taskDTO.description())
                .dueDate(taskDTO.dueDate())
                .priority(taskDTO.priority())
                .isCompleted(false)
                .createdAt(LocalDateTime.now())
                .assignedTo(assignedTo)
                .crmLead(crmLead)
                .build();

        // 4. Guardar y devolver DTO
        Task savedTask = taskRepository.save(task);

        System.out.println("DEBUG PREFS: " + assignedTo.getPreferences());
        if (assignedTo.getPreferences() != null) {
            System.out.println("notifyTaskReminders = " + assignedTo.getPreferences().isNotifyTaskReminders());
        }

        if (task.getDueDate() != null && assignedTo.getPreferences() != null && assignedTo.getPreferences().isNotifyTaskReminders()) {
            long hoursToDue = LocalDateTime.now().until(task.getDueDate(), java.time.temporal.ChronoUnit.HOURS);
            if (hoursToDue <= 24) {
                notificationService.createNotification(
                        assignedTo,
                        task.getCrmLead(),
                        NotificationType.TASK_DUE,
                        "Upcoming task: " + task.getTitle() + " due at " + task.getDueDate()
                );
            }
        }
        return taskMapper.toDTO(savedTask);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new RuntimeException("Tarea no encontrada con ID: " + taskId);
        }
        taskRepository.deleteById(taskId);
    }

    @Transactional
    public TaskDTO updateTask(Long id, CreateUpdateTaskDTO taskDTO) {

        // 1. Buscar la tarea existente
        Task taskToUpdate = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con ID: " + id));

        // 2. Validar y actualizar el contacto asociado (si el ID es diferente)
        if (!taskToUpdate.getCrmLead().getId().equals(taskDTO.crmLead_Id())) {
            CrmLead crmLead = crmLeadRepository.findById(taskDTO.crmLead_Id())
                    .orElseThrow(() -> new RuntimeException("Contacto no encontrado con ID: " + taskDTO.crmLead_Id()));
            taskToUpdate.setCrmLead(crmLead);
        }

        // 3. Actualizar campos básicos
        taskToUpdate.setTitle(taskDTO.title());
        taskToUpdate.setDescription(taskDTO.description());
        taskToUpdate.setDueDate(taskDTO.dueDate());
        taskToUpdate.setPriority(taskDTO.priority());

        // 4. Guardar y devolver DTO
        Task savedTask = taskRepository.save(taskToUpdate);
        return taskMapper.toDTO(savedTask);
    }

    @Transactional
    public TaskDTO toggleCompletedStatus(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con ID: " + taskId));

        // Invertir estado: Si es true pasa a false, y viceversa
        task.setCompleted(!task.isCompleted());

        Task updatedTask = taskRepository.save(task);
        return taskMapper.toDTO(updatedTask);
    }

}



