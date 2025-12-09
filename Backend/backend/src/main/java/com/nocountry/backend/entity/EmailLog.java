package com.nocountry.backend.entity;

import com.nocountry.backend.enums.EmailStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "lead_id")
    private CrmLead lead;

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String body;

    private String providerMessageId;

    @Enumerated(EnumType.STRING)
    private EmailStatus status;

    private LocalDateTime createdAt;
}