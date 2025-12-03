package com.nocountry.backend.services;

import com.nocountry.backend.dto.NotificationDTO;
import com.nocountry.backend.entity.*;
import com.nocountry.backend.enums.NotificationEntityType;
import com.nocountry.backend.enums.NotificationType;
import com.nocountry.backend.enums.Stage;
import com.nocountry.backend.mappers.NotificationMapper;
import com.nocountry.backend.repository.NotificationRepository;
import com.nocountry.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UserRepository userRepository;

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

}