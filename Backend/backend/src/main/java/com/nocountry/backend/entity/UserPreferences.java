package com.nocountry.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_preferences")
public class UserPreferences {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "dark_mode", columnDefinition = "TINYINT(1) default 0")
    private boolean darkMode = false;

    @Column(name = "auto_save_conv", columnDefinition = "TINYINT(1) default 1")
    private boolean autoSaveConv = true;

    @Column(name = "notify_new_messages", columnDefinition = "TINYINT(1) default 1")
    private boolean notifyNewMessages = true;

    @Column(name = "notify_task_reminders", columnDefinition = "TINYINT(1) default 1")
    private boolean notifyTaskReminders = true;

    @Column(name = "notify_daily_summary", columnDefinition = "TINYINT(1) default 0")
    private boolean notifyDailySummary = false;

    @Column(name = "notify_stage_change", columnDefinition = "TINYINT(1) default 1")
    private boolean notifyStageChange = true;

    @Column(name = "notify_automation_trigger", columnDefinition = "TINYINT(1) default 1")
    private boolean notifyAutomationTrigger = true;
}