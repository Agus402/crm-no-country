package com.nocountry.backend.repository;

import com.nocountry.backend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {


    List<Task> findByAssignedToIdAndIsCompleted(Long userId, boolean isCompleted);

    List<Task> findByAssignedToIdAndDueDateBetween(Long userId, LocalDateTime startOfDay, LocalDateTime endOfDay);

    @Query("SELECT t FROM Task t WHERE t.assignedTo.id = :userId " +
            "AND t.isCompleted = :isCompleted " +
            "AND ( t.isAutomated = :automated) " +
            "ORDER BY t.dueDate ASC")
    List<Task> findFilteredTasks(
            @Param("userId") Long userId,
            @Param("isCompleted") boolean isCompleted,
            @Param("automated") Boolean automated
    );

    List<Task> findByAssignedToIdAndIsCompletedAndIsAutomated(Long userId, boolean isCompleted, Boolean isAutomated);

}

