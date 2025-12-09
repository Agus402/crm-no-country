package com.nocountry.backend.repository;

import com.nocountry.backend.entity.IntegrationConfig;
import com.nocountry.backend.enums.IntegrationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IntegrationConfigRepository extends JpaRepository<IntegrationConfig, Long> {
    Optional<IntegrationConfig> findByIntegrationType(IntegrationType integrationType);
}
