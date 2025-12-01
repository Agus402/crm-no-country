package com.nocountry.backend.entity;
import com.nocountry.backend.enums.Channel;
import com.nocountry.backend.enums.Stage;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "crm_lead")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CrmLead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;

    @Enumerated(EnumType.STRING)
    private Stage stage;

    @Enumerated(EnumType.STRING)
    private Channel channel;

    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private boolean deleted = false;


    @ManyToMany
    @JoinTable(
            name = "lead_tag",
            joinColumns = @JoinColumn(name = "lead_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tag;

}