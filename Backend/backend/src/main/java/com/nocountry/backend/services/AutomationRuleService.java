package com.nocountry.backend.services;

import com.nocountry.backend.dto.AutomationRuleDTO;
import com.nocountry.backend.dto.CreateUpdateAutomationRuleDTO;
import com.nocountry.backend.entity.AutomationRule;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.mappers.AutomationRuleMapper;
import com.nocountry.backend.repository.AutomationRuleRepository;
import com.nocountry.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor

public class AutomationRuleService {

    private final AutomationRuleRepository ruleRepository;
    private final UserRepository userRepository;
    private final AutomationRuleMapper ruleMapper;

    // --- C. CREATE ---
    @Transactional
    public AutomationRuleDTO createRule(CreateUpdateAutomationRuleDTO dto, Long creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Usuario creador no encontrado."));

        AutomationRule rule = ruleMapper.toEntity(dto);
        rule.setCreatedBy(creator);
        rule.setCreatedAt(LocalDateTime.now());

        rule = ruleRepository.save(rule);
        return ruleMapper.toDTO(rule);
    }

    // --- R. READ (Find All) ---
    public List<AutomationRuleDTO> findAll() {
        return ruleRepository.findAll().stream()
                .map(ruleMapper::toDTO)
                .toList();
    }

    // --- R. READ (Find By ID) ---
    public AutomationRuleDTO findById(Long id) {
        AutomationRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Regla de automatización no encontrada."));
        return ruleMapper.toDTO(rule);
    }

    // --- U. UPDATE ---
    @Transactional
    public AutomationRuleDTO updateRule(Long id, CreateUpdateAutomationRuleDTO dto) {
        AutomationRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Regla de automatización a actualizar no encontrada."));

        // Uso del mapper con nullValuePropertyMappingStrategy = IGNORE
        ruleMapper.updateEntityFromDto(dto, rule);

        // La actualización de createdBy se ignora, manteniendo el original.

        rule = ruleRepository.save(rule);
        return ruleMapper.toDTO(rule);
    }

    // --- D. DELETE ---
    @Transactional
    public void deleteRule(Long id) {
        if (!ruleRepository.existsById(id)) {
            throw new RuntimeException("Regla de automatización a eliminar no encontrada.");
        }
        ruleRepository.deleteById(id);
    }

}
