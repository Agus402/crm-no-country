package com.nocountry.backend.repository;

import com.nocountry.backend.entity.AutomationExecutionQueue;
import com.nocountry.backend.enums.ExecutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AutomationExecutionQueueRepository extends JpaRepository<AutomationExecutionQueue, Long> {

    List<AutomationExecutionQueue> findByStatusAndScheduledAtLessThanEqual(
            ExecutionStatus status,
            LocalDateTime now);
}
