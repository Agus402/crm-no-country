package com.nocountry.backend.services;

import com.nocountry.backend.dto.CreateUpdateTaskDTO;
import com.nocountry.backend.dto.TaskDTO;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.entity.Task;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.mappers.TaskMapper;
import com.nocountry.backend.repository.CrmLeadRepository;
import com.nocountry.backend.repository.TaskRepository;
import com.nocountry.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CrmLeadRepository crmLeadRepository; // Asegúrate de importar el repo correcto
    private final TaskMapper taskMapper;

    @Transactional
    public TaskDTO findTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + id));
        return taskMapper.toDTO(task);
    }

    @Transactional
    public List<TaskDTO> findPendingTasks(Long userId) {
        List<Task> tasks = taskRepository.findByAssignedToIdAndIsCompletedAndIsAutomated(userId, false, false);
        return taskMapper.toDTOList(tasks);
    }

    @Transactional
    public List<TaskDTO> findCompletedTasks(Long userId) {
        List<Task> tasks = taskRepository.findByAssignedToIdAndIsCompleted(userId, true);
        return taskMapper.toDTOList(tasks);
    }

    @Transactional
    public List<TaskDTO> findAutomatedTasks(Long userId) {
        // Usa el método derivado para el filtro específico:
        // isCompleted = false, isAutomated = true
        List<Task> tasks = taskRepository.findByAssignedToIdAndIsCompletedAndIsAutomated(userId, false, true);
        return taskMapper.toDTOList(tasks);
    }

    @Transactional
    public List<TaskDTO> findTasksDueToday(Long userId) {

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        List<Task> tasks = taskRepository.findByAssignedToIdAndDueDateBetween(
                userId, startOfDay, endOfDay
        );

        return taskMapper.toDTOList(tasks);
    }

    @Transactional
    public TaskDTO createTask(CreateUpdateTaskDTO taskDTO, Long assignedToId) {

        // Validar existencia del usuario asignado
        User assignedTo = userRepository.findById(assignedToId)
                .orElseThrow(() -> new RuntimeException("Assigned user not found with ID: " + assignedToId));

        // Validar existencia del contacto asociado
        CrmLead crmLead = crmLeadRepository.findById(taskDTO.crmLead_Id())
                .orElseThrow(() -> new RuntimeException("Contact assigned not found with ID " + taskDTO.crmLead_Id()));

        Task task = Task.builder()
                .title(taskDTO.title())
                .description(taskDTO.description())
                .taskType(taskDTO.taskType())
                .dueDate(taskDTO.dueDate())
                .priority(taskDTO.priority())
                .isAutomated(false)
                .createdAt(LocalDateTime.now())
                .assignedTo(assignedTo)
                .crmLead(crmLead)
                .build();

        Task savedTask = taskRepository.save(task);
        return taskMapper.toDTO(savedTask);
    }

    @Transactional
    public void deleteTask(Long taskId) {

        if (!taskRepository.existsById(taskId)) {
            throw new RuntimeException("Task not found with ID: " + taskId);
        }
        taskRepository.deleteById(taskId);
    }

    @Transactional
    public TaskDTO updateTask(Long id, CreateUpdateTaskDTO taskDTO) {

        Task taskToUpdate = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + id));

        // Validar y actualizar el contacto asociado (si el ID es diferente)
        if (!taskToUpdate.getCrmLead().getId().equals(taskDTO.crmLead_Id())) {
            CrmLead crmLead = crmLeadRepository.findById(taskDTO.crmLead_Id())
                    .orElseThrow(() -> new RuntimeException("Contact not found with ID: " + taskDTO.crmLead_Id()));
            taskToUpdate.setCrmLead(crmLead);
        }

        taskToUpdate.setTitle(taskDTO.title());
        taskToUpdate.setDescription(taskDTO.description());
        taskToUpdate.setTaskType(taskDTO.taskType());
        taskToUpdate.setDueDate(taskDTO.dueDate());
        taskToUpdate.setCompleted(taskDTO.isAutomated());
        taskToUpdate.setPriority(taskDTO.priority());

        Task savedTask = taskRepository.save(taskToUpdate);
        return taskMapper.toDTO(savedTask);
    }

    @Transactional
    public TaskDTO toggleCompletedStatus(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + taskId));

        // Invertir estado: Si es true pasa a false, y viceversa
        task.setCompleted(!task.isCompleted());

        Task updatedTask = taskRepository.save(task);
        return taskMapper.toDTO(updatedTask);
    }

    public List<TaskDTO> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        return taskMapper.toDTOList(tasks);

    }
}