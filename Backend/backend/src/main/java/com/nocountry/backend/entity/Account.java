package com.nocountry.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String companyName;

    private String industry;

    private String website;

    private String phone;

    private String address;

    private String timeZone;

    private String dateFormat;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Relación N:1 con USER (Dueño de la cuenta)
    // El 'owner_user_id' es la clave foránea en la tabla 'account'
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id")
    @JsonIgnoreProperties("account")
    private User owner;

    // Relación 1:N con USER (Miembros del equipo)
    @JsonIgnore
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL)
    private List<User> users;

    // Relación 1:N con CRM_LEAD (Leads asociados a esta empresa)
    @JsonIgnore
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL)
    private List<CrmLead> crmLeads;

    // Relación 1:N con INTEGRATION_CONFIG
    @JsonIgnore
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL)
    private List<IntegrationConfig> integrations;

}
