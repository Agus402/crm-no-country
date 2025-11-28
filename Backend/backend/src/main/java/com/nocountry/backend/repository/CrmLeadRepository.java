package com.nocountry.backend.repository;

import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.enums.Stage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CrmLeadRepository extends JpaRepository<CrmLead, Long> {
    List<CrmLead> findByDeletedFalse();
    List<CrmLead> findByDeletedFalseAndNameContainingIgnoreCase(String name);
    List<CrmLead> findByDeletedFalseAndEmailContainingIgnoreCase(String email);

    List<CrmLead> findByDeletedFalseAndStage(Stage stage);
    List<CrmLead> findByDeletedFalseAndNameContainingIgnoreCaseAndStage(String name, Stage stage);
    List<CrmLead> findByDeletedFalseAndEmailContainingIgnoreCaseAndStage(String email, Stage stage);

    List<CrmLead> findByDeletedTrue();



}
