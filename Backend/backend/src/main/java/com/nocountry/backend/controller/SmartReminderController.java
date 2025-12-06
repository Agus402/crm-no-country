package com.nocountry.backend.controller;

import com.nocountry.backend.dto.SmartReminderDTO;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.repository.UserRepository;
import com.nocountry.backend.services.SmartReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/smart-reminders")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class SmartReminderController {

    private final SmartReminderService smartReminderService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new RuntimeException("User not authenticated");
        }
        if (authentication.getPrincipal() instanceof User user) {
            return user.getId();
        }
        // Fallback: get user by email
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<SmartReminderDTO>> getSmartReminders() {
        Long userId = getCurrentUserId();
        List<SmartReminderDTO> reminders = smartReminderService.getSmartReminders(userId);
        return ResponseEntity.ok(reminders);
    }
}

