package com.nocountry.backend.services;

import com.nocountry.backend.dto.NotificationDTO;
import com.nocountry.backend.entity.*;
import com.nocountry.backend.enums.EmailStatus;
import com.nocountry.backend.enums.NotificationEntityType;
import com.nocountry.backend.enums.NotificationType;
import com.nocountry.backend.mappers.NotificationMapper;
import com.nocountry.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UserRepository userRepository;
    private final CrmLeadRepository crmLeadRepository;
    private final EmailLogRepository emailLogRepository;
    private final LeadHistoryRepository leadHistoryRepository;
    private final TaskRepository taskRepository;

    public void createNotification(User user, CrmLead lead, NotificationType type, String body) {
        System.out.println(">>> NOTIFICATION SERVICE TRIGGERED");

        if (user == null) return;

        UserPreferences preferences = user.getPreferences();
        if (preferences == null) return;

        boolean allowed = switch (type) {
            case NEW_MESSAGE -> preferences.isNotifyNewMessages();
            case TASK_DUE -> preferences.isNotifyTaskReminders();
            case AUTOMATION_ALERT -> preferences.isNotifyAutomationTrigger();
            case STAGE_CHANGE -> preferences.isNotifyStageChange();

        };

        if (!allowed) return;

        Notification notification = Notification.builder()
                .user(user)
                .lead(lead)
                .type(type)
                .body(body)
                .entityType(NotificationEntityType.LEAD)
                .entityId(lead != null ? lead.getId() : null)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    public List<NotificationDTO> getNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(notificationMapper::toDTO)
                .toList();
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    public List<Map<String, Object>> getSmartReminders(Long userId) {
        List<Map<String, Object>> reminders = new ArrayList<>();
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
                .sorted((a, b) -> {
                    LocalDateTime aTime = (LocalDateTime) a.get("createdAt");
                    LocalDateTime bTime = (LocalDateTime) b.get("createdAt");
                    return bTime.compareTo(aTime);
                })
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getLeadsWithoutResponse(List<CrmLead> leads, LocalDateTime now) {
        List<Map<String, Object>> reminders = new ArrayList<>();
        
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
                    Map<String, Object> reminder = new HashMap<>();
                    reminder.put("id", lead.getId());
                    reminder.put("text", lead.getName() + " hasn't responded in " + daysSinceLastInteraction + " days");
                    reminder.put("time", timeAgo);
                    reminder.put("type", "NO_RESPONSE");
                    reminder.put("leadId", lead.getId());
                    reminder.put("leadName", lead.getName());
                    reminder.put("createdAt", lastInteraction);
                    reminders.add(reminder);
                }
            }
        }

        return reminders;
    }

    private List<Map<String, Object>> getLeadsWithMultipleEmailOpens(List<CrmLead> leads, LocalDateTime now) {
        List<Map<String, Object>> reminders = new ArrayList<>();

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
                Map<String, Object> reminder = new HashMap<>();
                reminder.put("id", lead.getId() + 10000L); // Unique ID
                reminder.put("text", lead.getName() + " opened your email " + openedEmails.size() + " times");
                reminder.put("time", timeAgo);
                reminder.put("type", "EMAIL_OPENED");
                reminder.put("leadId", lead.getId());
                reminder.put("leadName", lead.getName());
                reminder.put("createdAt", lastOpen);
                reminders.add(reminder);
            }
        }

        return reminders;
    }

    private List<Map<String, Object>> getUpcomingDemos(Long userId, LocalDateTime now) {
        List<Map<String, Object>> reminders = new ArrayList<>();
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
            
            Map<String, Object> reminder = new HashMap<>();
            reminder.put("id", task.getId() + 20000L); // Unique ID
            reminder.put("text", "Demo scheduled with " + leadName + " in " + daysUntil + " day" + (daysUntil != 1 ? "s" : ""));
            reminder.put("time", timeAgo);
            reminder.put("type", "UPCOMING_DEMO");
            reminder.put("leadId", task.getCrmLead() != null ? task.getCrmLead().getId() : null);
            reminder.put("leadName", leadName);
            reminder.put("createdAt", task.getCreatedAt());
            reminders.add(reminder);
        }

        return reminders;
    }

    private List<Map<String, Object>> getLeadsNeedingFollowUp(List<CrmLead> leads, LocalDateTime now) {
        List<Map<String, Object>> reminders = new ArrayList<>();
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
            Map<String, Object> reminder = new HashMap<>();
            reminder.put("id", 30000L); // Unique ID
            reminder.put("text", leadsNeedingFollowUp + " lead" + (leadsNeedingFollowUp != 1 ? "s" : "") + " need follow-up this week");
            reminder.put("time", "1 day ago");
            reminder.put("type", "FOLLOW_UP_NEEDED");
            reminder.put("leadId", null);
            reminder.put("leadName", null);
            reminder.put("createdAt", now.minusDays(1));
            reminders.add(reminder);
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