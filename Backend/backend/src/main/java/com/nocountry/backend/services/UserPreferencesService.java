package com.nocountry.backend.services;

import com.nocountry.backend.dto.UpdateUserPreferencesDTO;
import com.nocountry.backend.dto.UserPreferencesDTO;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.entity.UserPreferences;
import com.nocountry.backend.mappers.UserPreferencesMapper;
import com.nocountry.backend.repository.UserPreferencesRepository;
import com.nocountry.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserPreferencesService {

    private final UserPreferencesRepository userPreferencesRepository;
    private final UserRepository userRepository;
    private final UserPreferencesMapper preferencesMapper;

    public UserPreferencesDTO getOrCreatePreferences(Long userId) {
        UserPreferences preferences = userPreferencesRepository.findById(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        return preferencesMapper.toDTO(preferences);
    }

    private UserPreferences createDefaultPreferences(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado para crear preferencias."));

        UserPreferences defaultPrefs = UserPreferences.builder()
                .user(user)
                .darkMode(false)
                .autoSaveConv(true)
                .notifyNewMessages(true)
                .notifyTaskReminders(true)
                .notifyStageChange(true)
                .notifyAutomationTrigger(false)
                .build();

        return userPreferencesRepository.save(defaultPrefs);
    }

    @Transactional
    public UserPreferencesDTO updatePreferences(Long userId, UpdateUserPreferencesDTO dto) {
        UserPreferences preferences = userPreferencesRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Preferencias no encontradas para el usuario: " + userId));

        preferencesMapper.updateEntityFromDto(dto, preferences);

        UserPreferences savedPreferences = userPreferencesRepository.save(preferences);
        return preferencesMapper.toDTO(savedPreferences);
    }
}
