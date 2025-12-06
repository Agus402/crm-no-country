package com.nocountry.backend.controller;

import com.nocountry.backend.dto.NotificationDTO;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.services.NotificationService;
import com.nocountry.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<NotificationDTO> getNotifications() {
        return notificationService.getNotificationsForUser(getCurrentUser());
    }

    @PostMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    @GetMapping("/smart-reminders")
    public ResponseEntity<List<Map<String, Object>>> getSmartReminders() {
        User user = getCurrentUser();
        List<Map<String, Object>> reminders = notificationService.getSmartReminders(user.getId());
        return ResponseEntity.ok(reminders);
    }
}