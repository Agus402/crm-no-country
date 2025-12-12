package com.nocountry.backend.entity;

import com.nocountry.backend.enums.Direction;
import com.nocountry.backend.enums.MessageType;
import com.nocountry.backend.enums.SenderType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "message")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type", nullable = false)
    private SenderType senderType;

    @Column(name = "sender_lead_id")
    private Long senderLeadId;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", nullable = false)
    private Direction messageDirection;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)
    private MessageType messageType;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String mediaUrl;

    private String mediaFileName;

    private String mediaType;

    @Column(columnDefinition = "TEXT")
    private String mediaCaption;

    private String externalMessageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "email_template_id")
    private EmailTemplate emailTemplate;

    private LocalDateTime sentAt;

    // Reply-to message support (WhatsApp quoted messages)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_to_message_id")
    private Message replyToMessage;

}
