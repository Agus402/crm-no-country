package com.nocountry.backend.dto;

import java.io.Serializable;

public record UserPreferencesDTO(

        Long userId,
        Boolean darkMode,
        Boolean autoSaveConv,
        Boolean notifyNewMessages,
        Boolean notifyTaskReminders,
        Boolean notifyDailySummary,
        Boolean notifyStageChange,
        Boolean notifyAutomationTrigger

) implements Serializable {}
