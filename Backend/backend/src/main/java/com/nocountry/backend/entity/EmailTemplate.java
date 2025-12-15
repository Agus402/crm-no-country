package com.nocountry.backend.entity;

import com.nocountry.backend.enums.Channel;
import com.nocountry.backend.enums.EmailTemplateType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "email_template")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String subject; // Email subject OR WhatsApp header

    @Column(columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    private EmailTemplateType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Channel channel = Channel.EMAIL;

    @Builder.Default
    private Boolean isActive = true;
}
