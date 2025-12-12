package com.nocountry.backend.services;

import com.nocountry.backend.entity.AutomationExecutionQueue;
import com.nocountry.backend.enums.ExecutionStatus;
import com.nocountry.backend.repository.AutomationExecutionQueueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AutomationScheduler {

    private final AutomationExecutionQueueRepository queueRepository;
    private final AutomationExecutionService executionService;

    @Scheduled(fixedRate = 60000) // Every minute
    @Transactional
    public void processQueue() {
        List<AutomationExecutionQueue> pending = queueRepository
                .findByStatusAndScheduledAtLessThanEqual(
                        ExecutionStatus.PENDING,
                        LocalDateTime.now());

        if (!pending.isEmpty()) {
            log.info("Processing {} pending automation executions", pending.size());
        }

        for (AutomationExecutionQueue item : pending) {
            try {
                item.setStatus(ExecutionStatus.EXECUTING);
                queueRepository.save(item);

                executionService.executeActions(
                        item.getAutomationRule(),
                        item.getLead());

                item.setStatus(ExecutionStatus.COMPLETED);
                item.setExecutedAt(LocalDateTime.now());
                log.info("Automation '{}' completed for lead {}",
                        item.getAutomationRule().getName(),
                        item.getLead().getId());
            } catch (Exception e) {
                item.setStatus(ExecutionStatus.FAILED);
                item.setErrorMessage(e.getMessage());
                item.setRetryCount(item.getRetryCount() + 1);
                log.error("Automation '{}' failed for lead {}: {}",
                        item.getAutomationRule().getName(),
                        item.getLead().getId(),
                        e.getMessage());
            }
            queueRepository.save(item);
        }
    }
}
