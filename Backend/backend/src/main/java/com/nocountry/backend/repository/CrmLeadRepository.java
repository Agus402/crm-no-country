package com.nocountry.backend.repository;

import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.enums.Stage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CrmLeadRepository extends JpaRepository<CrmLead, Long> {
    List<CrmLead> findByNameContainingIgnoreCase(String name);
    List<CrmLead> findByEmailContainingIgnoreCase(String email);
    List<CrmLead> findByStage(Stage stage);


    List<CrmLead> findByNameContainingIgnoreCaseAndStage(
            String name, Stage stage
    );

    List<CrmLead> findByEmailContainingIgnoreCaseAndStage(
            String email, Stage stage
    );


}
