package com.nocountry.backend.entity;

import com.nocountry.backend.enums.ConversationStatus;
import com.nocountry.backend.enums.Direction;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conversation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "lead_id")
    private CrmLead lead;

    @ManyToOne
    @JoinColumn(name = "assigned_user_id")
    private User assignedUser;

    private String externalId;

    @Column(columnDefinition = "TEXT")
    private String lastMessageText;

    @Enumerated(EnumType.STRING)
    private Direction lastMessageDirection;

    private Integer unreadCount = 0;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime lastMessageAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConversationStatus status = ConversationStatus.OPEN;

    private LocalDateTime firstInboundAt;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();

}

