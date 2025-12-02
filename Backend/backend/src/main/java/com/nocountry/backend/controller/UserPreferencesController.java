package com.nocountry.backend.controller;

import com.nocountry.backend.dto.UpdateUserPreferencesDTO;
import com.nocountry.backend.dto.UserPreferencesDTO;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.services.UserPreferencesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
public class UserPreferencesController {

    private final UserPreferencesService userPreferencesService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return user.getId();
        }
        throw new IllegalStateException("Usuario no autenticado");
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserPreferencesDTO> getMyPreferences() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(userPreferencesService.getOrCreatePreferences(userId));
    }

    @PatchMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserPreferencesDTO> updateMyPreferences(@Valid @RequestBody UpdateUserPreferencesDTO dto) {
        Long userId = getCurrentUserId();
        UserPreferencesDTO updated = userPreferencesService.updatePreferences(userId, dto);
        return ResponseEntity.ok(updated);
    }
}
