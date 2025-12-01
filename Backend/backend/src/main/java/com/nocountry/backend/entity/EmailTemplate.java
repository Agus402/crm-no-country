package com.nocountry.backend.entity;

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

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String body;

}

