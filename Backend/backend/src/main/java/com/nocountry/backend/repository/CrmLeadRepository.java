package com.nocountry.backend.repository;

import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.enums.Stage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CrmLeadRepository extends JpaRepository<CrmLead, Long> {
        List<CrmLead> findByDeletedFalse();

        List<CrmLead> findByDeletedFalseAndNameContainingIgnoreCase(String name);

        List<CrmLead> findByDeletedFalseAndEmailContainingIgnoreCase(String email);

        List<CrmLead> findByDeletedFalseAndStage(Stage stage);

        List<CrmLead> findByDeletedFalseAndNameContainingIgnoreCaseAndStage(String name, Stage stage);

        List<CrmLead> findByDeletedFalseAndEmailContainingIgnoreCaseAndStage(String email, Stage stage);

        List<CrmLead> findByDeletedTrue();

        boolean existsByEmailIgnoreCase(String email);

        /**
         * Verifica si existe un lead con el email dado para un usuario específico.
         */
        boolean existsByOwnerIdAndEmailIgnoreCase(Long ownerId, String email);

        Optional<CrmLead> findFirstByEmailIgnoreCase(String email);

        /**
         * Busca un Lead por número de teléfono.
         * Utilizado para identificar o crear Leads desde mensajes de WhatsApp.
         */
        Optional<CrmLead> findByPhone(String phone);

        // ==================== USER-FILTERED QUERIES ====================

        /**
         * Busca todos los leads no eliminados que pertenecen a un usuario específico.
         */
        List<CrmLead> findByOwnerIdAndDeletedFalse(Long ownerId);

        /**
         * Busca leads por nombre (parcial) filtrados por propietario.
         */
        List<CrmLead> findByOwnerIdAndDeletedFalseAndNameContainingIgnoreCase(Long ownerId, String name);

        /**
         * Busca leads por email (parcial) filtrados por propietario.
         */
        List<CrmLead> findByOwnerIdAndDeletedFalseAndEmailContainingIgnoreCase(Long ownerId, String email);

        /**
         * Busca leads por stage filtrados por propietario.
         */
        List<CrmLead> findByOwnerIdAndDeletedFalseAndStage(Long ownerId, Stage stage);

        /**
         * Busca leads por nombre y stage filtrados por propietario.
         */
        List<CrmLead> findByOwnerIdAndDeletedFalseAndNameContainingIgnoreCaseAndStage(Long ownerId, String name,
                        Stage stage);

        /**
         * Busca leads por email y stage filtrados por propietario.
         */
        List<CrmLead> findByOwnerIdAndDeletedFalseAndEmailContainingIgnoreCaseAndStage(Long ownerId, String email,
                        Stage stage);
}
