package com.nocountry.backend.entity;

import com.nocountry.backend.dto.CrmLeadDTO;
import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "tag")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String color;

    @ManyToMany(mappedBy = "tag")
    private Set<CrmLead> crmLeads;

}
