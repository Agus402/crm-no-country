package com.nocountry.backend.dto;

import io.micrometer.common.lang.Nullable;

public record UpdateUserPreferencesDTO(
        @Nullable Boolean darkMode,
        @Nullable Boolean autoSaveConv,
        @Nullable Boolean notifyNewMessages,
        @Nullable Boolean notifyTaskReminders,
        @Nullable Boolean notifyDailySummary,
        @Nullable Boolean notifyStageChange,
        @Nullable Boolean notifyAutomationTrigger
) {
}
