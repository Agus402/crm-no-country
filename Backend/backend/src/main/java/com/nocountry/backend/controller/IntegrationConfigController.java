package com.nocountry.backend.controller;

import com.nocountry.backend.dto.CreateUpdateIntegrationConfigDTO;
import com.nocountry.backend.dto.IntegrationConfigDTO;
import com.nocountry.backend.services.IntegrationConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/integration-configs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class IntegrationConfigController {

    private final IntegrationConfigService configService;

    @PostMapping
    public ResponseEntity<IntegrationConfigDTO> create(@Valid @RequestBody CreateUpdateIntegrationConfigDTO dto) {
        IntegrationConfigDTO newConfig = configService.createConfig(dto);
        return new ResponseEntity<>(newConfig, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<IntegrationConfigDTO>> getAll() {
        return ResponseEntity.ok(configService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IntegrationConfigDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(configService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IntegrationConfigDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateUpdateIntegrationConfigDTO dto) {

        IntegrationConfigDTO updatedConfig = configService.updateConfig(id, dto);
        return ResponseEntity.ok(updatedConfig);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        configService.deleteConfig(id);
    }
}
