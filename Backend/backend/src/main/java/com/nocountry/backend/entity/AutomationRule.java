package com.nocountry.backend.entity;

import com.nocountry.backend.enums.TriggerEvent;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "automation_rule")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutomationRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_event", nullable = false)
    private TriggerEvent triggerEvent;

    @Column(name = "trigger_value")
    private String triggerValue; // trigger value VARCHAR(255)

    @Column(name = "actions", columnDefinition = "JSON")
    private String actions;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "wait_days")
    @Builder.Default
    private Integer waitDays = 0;

    @Column(name = "wait_hours")
    @Builder.Default
    private Integer waitHours = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToMany
    @JoinTable(name = "automation_rule_lead", joinColumns = @JoinColumn(name = "automation_rule_id"), inverseJoinColumns = @JoinColumn(name = "lead_id"))
    @Builder.Default
    private Set<CrmLead> leads = new HashSet<>();

}
