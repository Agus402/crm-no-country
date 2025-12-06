package com.nocountry.backend.services;

import com.nocountry.backend.dto.SmartReminderDTO;
import com.nocountry.backend.entity.*;
import com.nocountry.backend.enums.EmailStatus;
import com.nocountry.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SmartReminderService {

    private final CrmLeadRepository crmLeadRepository;
    private final EmailLogRepository emailLogRepository;
    private final LeadHistoryRepository leadHistoryRepository;
    private final TaskRepository taskRepository;

    public List<SmartReminderDTO> getSmartReminders(Long userId) {
        List<SmartReminderDTO> reminders = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // Get user's leads
        List<CrmLead> userLeads = crmLeadRepository.findByDeletedFalse().stream()
                .filter(lead -> lead.getOwner() != null && lead.getOwner().getId().equals(userId))
                .collect(Collectors.toList());

        // 1. Leads sin respuesta en 3+ días
        reminders.addAll(getLeadsWithoutResponse(userLeads, now));

        // 2. Leads que han abierto emails múltiples veces
        reminders.addAll(getLeadsWithMultipleEmailOpens(userLeads, now));

        // 3. Demos programadas próximas
        reminders.addAll(getUpcomingDemos(userId, now));

        // 4. Leads que necesitan follow-up esta semana
        reminders.addAll(getLeadsNeedingFollowUp(userLeads, now));

        // Sort by createdAt (most recent first) and limit to top 10
        return reminders.stream()
                .sorted((a, b) -> b.createdAt().compareTo(a.createdAt()))
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<SmartReminderDTO> getLeadsWithoutResponse(List<CrmLead> leads, LocalDateTime now) {
        List<SmartReminderDTO> reminders = new ArrayList<>();
        
        for (CrmLead lead : leads) {
            // Get last interaction (email sent or history entry)
            LocalDateTime lastEmailSent = emailLogRepository.findByLeadId(lead.getId()).stream()
                    .map(EmailLog::getCreatedAt)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);

            LocalDateTime lastHistoryEntry = leadHistoryRepository.findByLeadIdOrderByCreatedAtDesc(lead.getId()).stream()
                    .findFirst()
                    .map(LeadHistory::getCreatedAt)
                    .orElse(null);

            LocalDateTime lastInteraction = null;
            if (lastEmailSent != null && lastHistoryEntry != null) {
                lastInteraction = lastEmailSent.isAfter(lastHistoryEntry) ? lastEmailSent : lastHistoryEntry;
            } else if (lastEmailSent != null) {
                lastInteraction = lastEmailSent;
            } else if (lastHistoryEntry != null) {
                lastInteraction = lastHistoryEntry;
            } else {
                // If no interaction, use lead creation date
                lastInteraction = lead.getCreatedAt();
            }

            if (lastInteraction != null) {
                long daysSinceLastInteraction = ChronoUnit.DAYS.between(lastInteraction, now);
                if (daysSinceLastInteraction >= 3) {
                    String timeAgo = formatTimeAgo(lastInteraction, now);
                    reminders.add(new SmartReminderDTO(
                            lead.getId(),
                            lead.getName() + " hasn't responded in " + daysSinceLastInteraction + " days",
                            timeAgo,
                            "NO_RESPONSE",
                            lead.getId(),
                            lead.getName(),
                            lastInteraction
                    ));
                }
            }
        }

        return reminders;
    }

    private List<SmartReminderDTO> getLeadsWithMultipleEmailOpens(List<CrmLead> leads, LocalDateTime now) {
        List<SmartReminderDTO> reminders = new ArrayList<>();

        for (CrmLead lead : leads) {
            List<EmailLog> openedEmails = emailLogRepository.findByLeadId(lead.getId()).stream()
                    .filter(email -> email.getStatus() == EmailStatus.OPENED)
                    .collect(Collectors.toList());

            if (openedEmails.size() >= 3) {
                LocalDateTime lastOpen = openedEmails.stream()
                        .map(EmailLog::getCreatedAt)
                        .max(LocalDateTime::compareTo)
                        .orElse(now);

                String timeAgo = formatTimeAgo(lastOpen, now);
                reminders.add(new SmartReminderDTO(
                        lead.getId() + 10000L, // Unique ID
                        lead.getName() + " opened your email " + openedEmails.size() + " times",
                        timeAgo,
                        "EMAIL_OPENED",
                        lead.getId(),
                        lead.getName(),
                        lastOpen
                ));
            }
        }

        return reminders;
    }

    private List<SmartReminderDTO> getUpcomingDemos(Long userId, LocalDateTime now) {
        List<SmartReminderDTO> reminders = new ArrayList<>();
        LocalDateTime in7Days = now.plusDays(7);

        List<Task> upcomingTasks = taskRepository.findByAssignedToIdAndIsCompleted(userId, false).stream()
                .filter(task -> task.getDueDate() != null 
                        && task.getDueDate().isAfter(now) 
                        && task.getDueDate().isBefore(in7Days)
                        && (task.getTitle().toLowerCase().contains("demo") 
                            || task.getDescription() != null && task.getDescription().toLowerCase().contains("demo")))
                .collect(Collectors.toList());

        for (Task task : upcomingTasks) {
            long daysUntil = ChronoUnit.DAYS.between(now, task.getDueDate());
            String leadName = task.getCrmLead() != null ? task.getCrmLead().getName() : "Unknown Contact";
            String timeAgo = formatTimeAgo(task.getCreatedAt(), now);
            
            reminders.add(new SmartReminderDTO(
                    task.getId() + 20000L, // Unique ID
                    "Demo scheduled with " + leadName + " in " + daysUntil + " day" + (daysUntil != 1 ? "s" : ""),
                    timeAgo,
                    "UPCOMING_DEMO",
                    task.getCrmLead() != null ? task.getCrmLead().getId() : null,
                    leadName,
                    task.getCreatedAt()
            ));
        }

        return reminders;
    }

    private List<SmartReminderDTO> getLeadsNeedingFollowUp(List<CrmLead> leads, LocalDateTime now) {
        List<SmartReminderDTO> reminders = new ArrayList<>();
        LocalDateTime weekAgo = now.minusDays(7);

        long leadsNeedingFollowUp = leads.stream()
                .filter(lead -> {
                    // Check if lead has no recent activity
                    LocalDateTime lastEmailSent = emailLogRepository.findByLeadId(lead.getId()).stream()
                            .map(EmailLog::getCreatedAt)
                            .max(LocalDateTime::compareTo)
                            .orElse(null);

                    LocalDateTime lastHistoryEntry = leadHistoryRepository.findByLeadIdOrderByCreatedAtDesc(lead.getId()).stream()
                            .findFirst()
                            .map(LeadHistory::getCreatedAt)
                            .orElse(null);

                    LocalDateTime lastActivity = null;
                    if (lastEmailSent != null && lastHistoryEntry != null) {
                        lastActivity = lastEmailSent.isAfter(lastHistoryEntry) ? lastEmailSent : lastHistoryEntry;
                    } else if (lastEmailSent != null) {
                        lastActivity = lastEmailSent;
                    } else if (lastHistoryEntry != null) {
                        lastActivity = lastHistoryEntry;
                    }

                    // Lead needs follow-up if no activity in last week or never had activity
                    return lastActivity == null || lastActivity.isBefore(weekAgo);
                })
                .count();

        if (leadsNeedingFollowUp > 0) {
            reminders.add(new SmartReminderDTO(
                    30000L, // Unique ID
                    leadsNeedingFollowUp + " lead" + (leadsNeedingFollowUp != 1 ? "s" : "") + " need follow-up this week",
                    "1 day ago",
                    "FOLLOW_UP_NEEDED",
                    null,
                    null,
                    now.minusDays(1)
            ));
        }

        return reminders;
    }

    private String formatTimeAgo(LocalDateTime past, LocalDateTime now) {
        long hours = ChronoUnit.HOURS.between(past, now);
        long days = ChronoUnit.DAYS.between(past, now);

        if (days > 0) {
            return days + " day" + (days != 1 ? "s" : "") + " ago";
        } else if (hours > 0) {
            return hours + " hour" + (hours != 1 ? "s" : "") + " ago";
        } else {
            long minutes = ChronoUnit.MINUTES.between(past, now);
            return minutes + " minute" + (minutes != 1 ? "s" : "") + " ago";
        }
    }
}

