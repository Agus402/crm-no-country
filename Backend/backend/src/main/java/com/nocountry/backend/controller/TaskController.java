package com.nocountry.backend.controller;

import com.nocountry.backend.dto.CreateUpdateTaskDTO;
import com.nocountry.backend.dto.TaskDTO;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.services.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return user.getId();
        }
        throw new IllegalStateException("User not found");
    }

    /**
     * GET /api/tasks
     * Obtiene las tareas del usuario logueado.
     * Permite filtrar por estado (completadas o pendientes).
     * Ejemplo: /api/tasks?completed=false (Trae las pendientes)
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TaskDTO>> getMyTasks(
            @RequestParam(required = false, defaultValue = "false") boolean completed
    ) {
        Long userId = getCurrentUserId();
        List<TaskDTO> tasks = taskService.findTasksByAssignedUser(userId, completed);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/due-today")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TaskDTO>> getTasksDueToday() {
        return ResponseEntity.ok(taskService.findTasksDueToday());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.findTaskById(id));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TaskDTO> createTask(@Valid @RequestBody CreateUpdateTaskDTO taskDTO) {
        Long userId = getCurrentUserId();
        TaskDTO newTask = taskService.createTask(taskDTO, userId);
        return new ResponseEntity<>(newTask, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TaskDTO> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody CreateUpdateTaskDTO taskDTO) {

        TaskDTO updatedTask = taskService.updateTask(id, taskDTO);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TaskDTO> toggleTaskCompletion(@PathVariable Long id) {
        TaskDTO updatedTask = taskService.toggleCompletedStatus(id);
        return ResponseEntity.ok(updatedTask);
    }


}
