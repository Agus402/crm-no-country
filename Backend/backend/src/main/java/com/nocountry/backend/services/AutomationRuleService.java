package com.nocountry.backend.services;

import com.nocountry.backend.dto.AutomationRuleDTO;
import com.nocountry.backend.dto.CreateUpdateAutomationRuleDTO;
import com.nocountry.backend.entity.AutomationRule;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.mappers.AutomationRuleMapper;
import com.nocountry.backend.repository.AutomationRuleRepository;
import com.nocountry.backend.repository.CrmLeadRepository;
import com.nocountry.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor

public class AutomationRuleService {

    private final AutomationRuleRepository ruleRepository;
    private final UserRepository userRepository;
    private final CrmLeadRepository crmLeadRepository;
    private final AutomationRuleMapper ruleMapper;

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

    public List<AutomationRuleDTO> findAll() {
        return ruleRepository.findAll().stream()
                .map(ruleMapper::toDTO)
                .toList();
    }

    public AutomationRuleDTO findById(Long id) {
        AutomationRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Regla de automatización no encontrada."));
        return ruleMapper.toDTO(rule);
    }

    @Transactional
    public AutomationRuleDTO updateRule(Long id, CreateUpdateAutomationRuleDTO dto) {
        AutomationRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Regla de automatización a actualizar no encontrada."));

        ruleMapper.updateEntityFromDto(dto, rule);

        rule = ruleRepository.save(rule);
        return ruleMapper.toDTO(rule);
    }

    @Transactional
    public void deleteRule(Long id) {
        if (!ruleRepository.existsById(id)) {
            throw new RuntimeException("Regla de automatización a eliminar no encontrada.");
        }
        ruleRepository.deleteById(id);
    }

    @Transactional
    public void assignContacts(Long ruleId, List<Long> contactIds) {
        AutomationRule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Regla de automatización no encontrada."));

        Set<CrmLead> leads = new HashSet<>(crmLeadRepository.findAllById(contactIds));
        rule.getLeads().addAll(leads);
        ruleRepository.save(rule);
    }

    public List<Long> getAssignedContacts(Long ruleId) {
        AutomationRule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Regla de automatización no encontrada."));

        return rule.getLeads().stream()
                .map(CrmLead::getId)
                .toList();
    }

}
