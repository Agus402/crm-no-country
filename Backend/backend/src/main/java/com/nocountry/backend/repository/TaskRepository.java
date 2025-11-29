package com.nocountry.backend.repository;

import com.nocountry.backend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Para filtrar por usuario y estado
    List<Task> findByAssignedToIdAndIsCompleted(Long assignedToId, boolean isCompleted);

    // Para obtener todas las pendientes (usado en findTasksDueToday)
    List<Task> findByIsCompleted(boolean isCompleted);
}
