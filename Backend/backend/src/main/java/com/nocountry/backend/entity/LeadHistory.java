package com.nocountry.backend.entity;

import com.nocountry.backend.enums.LeadHistoryAction;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lead_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "lead_id")
    private CrmLead lead;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private LeadHistoryAction action;

    private String attribute;

    @Column(columnDefinition = "TEXT")
    private String state;

    private LocalDateTime createdAt;

}

