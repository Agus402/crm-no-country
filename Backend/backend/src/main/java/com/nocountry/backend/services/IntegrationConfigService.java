package com.nocountry.backend.services;

import com.nocountry.backend.dto.CreateUpdateIntegrationConfigDTO;
import com.nocountry.backend.dto.IntegrationConfigDTO;
import com.nocountry.backend.entity.Account;
import com.nocountry.backend.entity.IntegrationConfig;
import com.nocountry.backend.mappers.IntegrationConfigMapper;
import com.nocountry.backend.repository.AccountRepository;
import com.nocountry.backend.repository.IntegrationConfigRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IntegrationConfigService {

    private final IntegrationConfigRepository configRepository;
    private final AccountRepository accountRepository;
    private final IntegrationConfigMapper integrationConfigMapper;

    @Transactional
    public IntegrationConfigDTO createConfig(CreateUpdateIntegrationConfigDTO dto) {
        Account account = accountRepository.findById(dto.accountId())
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada."));

        IntegrationConfig config = IntegrationConfig.builder()
                .account(account)
                .integrationType(dto.integrationType())
                .credentials(dto.credentials())
                .isConnected(true)
                .createdAt(LocalDateTime.now())
                .build();

        config = configRepository.save(config);

         return integrationConfigMapper.toDTO(config);
    }

    public List<IntegrationConfigDTO> findAll() {
        return configRepository.findAll().stream().map(integrationConfigMapper::toDTO).collect(Collectors.toList());
    }

    public IntegrationConfigDTO findById(Long id) {
        IntegrationConfig config = configRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuración no encontrada."));
        return integrationConfigMapper.toDTO(config);
    }

    @Transactional
    public IntegrationConfigDTO updateConfig(Long id, CreateUpdateIntegrationConfigDTO dto) {
        IntegrationConfig config = configRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuración a actualizar no encontrada."));

        config.setIntegrationType(dto.integrationType());
        config.setCredentials(dto.credentials());
        config = configRepository.save(config);
        return integrationConfigMapper.toDTO(config);
    }

    @Transactional
    public void deleteConfig(Long id) {
        if (!configRepository.existsById(id)) {
            throw new RuntimeException("Configuración a eliminar no encontrada.");
        }
        configRepository.deleteById(id);
    }
}
