package com.nocountry.backend.services;

import com.nocountry.backend.dto.*;
import com.nocountry.backend.entity.*;
import com.nocountry.backend.enums.LeadHistoryAction;
import com.nocountry.backend.enums.Stage;
import com.nocountry.backend.repository.*;
import com.nocountry.backend.mappers.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CrmLeadService {

    private final CrmLeadRepository crmLeadRepository;
    private final TagRepository tagRepository;
    private final CrmLeadMapper crmLeadMapper;
    private final LeadHistoryService leadHistoryService;

    public CrmLeadDTO create(CreateCrmLeadDTO dto) {

        if (crmLeadRepository.existsByEmailIgnoreCase(dto.email())) {
            throw new RuntimeException("A lead with this email already exists");
        }

        CrmLead crmLead = crmLeadMapper.toEntity(dto);
        crmLead.setCreatedAt(LocalDateTime.now());
        crmLead.setUpdatedAt(LocalDateTime.now());

        Set<Tag> tags = new HashSet<>(tagRepository.findAllById(dto.tagIds()));
        crmLead.setTag(tags);

        return crmLeadMapper.toDTO(crmLeadRepository.save(crmLead));
    }

    public CrmLeadDTO getById(Long id) {
        CrmLead lead = crmLeadRepository.findById(id)
                .filter(l -> !l.isDeleted())
                .orElseThrow(() -> new RuntimeException("Crm Lead not found or deleted"));

        return crmLeadMapper.toDTO(lead);
    }

    public CrmLeadDTO update(Long id, UpdateCrmLeadDTO dto) {
        CrmLead crmLead = crmLeadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Crm Lead not found"));

        if (dto.email() != null && !dto.email().equalsIgnoreCase(crmLead.getEmail())) {
            if (crmLeadRepository.existsByEmailIgnoreCase(dto.email())) {
                throw new RuntimeException("A lead with this email already exists");
            }
        }
        CrmLead before = CrmLead.builder()
                .id(crmLead.getId())
                .name(crmLead.getName())
                .email(crmLead.getEmail())
                .phone(crmLead.getPhone())
                .stage(crmLead.getStage())
                .tag(new HashSet<>(crmLead.getTag()))
                .build();

        crmLeadMapper.updateCrmLeadFromDto(dto, crmLead);

        if (dto.tagIds() != null) {
            crmLead.setTag(new HashSet<>(tagRepository.findAllById(dto.tagIds())));
        }

        crmLead.setUpdatedAt(LocalDateTime.now());

            CrmLead saved = crmLeadRepository.save(crmLead);

            detectChangesAndLog(before, saved);

            return crmLeadMapper.toDTO(saved);
    }


    public void delete(Long id) {
        CrmLead crmLead = crmLeadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Crm Lead not found"));

        crmLead.setDeleted(true);
        crmLead.setStage(Stage.LOST);
        crmLead.setUpdatedAt(LocalDateTime.now());

        crmLeadRepository.save(crmLead);
        leadHistoryService.log(
                crmLead,
                LeadHistoryAction.STATUS_CHANGE,
                "deleted",
                "Lead moved to deleted (soft delete)"
        );
    }

    public List<CrmLeadDTO> getAll(String name, String email, Stage stage) {

        boolean hasName = name != null && !name.isBlank();
        boolean hasEmail = email != null && !email.isBlank();
        boolean hasStage = stage != null;

        List<CrmLead> crmLeads;

        if (hasStage) {
            if (hasName) {
                crmLeads = crmLeadRepository.findByDeletedFalseAndNameContainingIgnoreCaseAndStage(name, stage);
            } else if (hasEmail) {
                crmLeads = crmLeadRepository.findByDeletedFalseAndEmailContainingIgnoreCaseAndStage(email, stage);
            } else {
                crmLeads = crmLeadRepository.findByDeletedFalseAndStage(stage);
            }
        } else {
            if (hasName) {
                crmLeads = crmLeadRepository.findByDeletedFalseAndNameContainingIgnoreCase(name);
            } else if (hasEmail) {
                crmLeads = crmLeadRepository.findByDeletedFalseAndEmailContainingIgnoreCase(email);
            } else {
                crmLeads = crmLeadRepository.findByDeletedFalse();
            }
        }

        return crmLeads.stream()
                .map(crmLeadMapper::toDTO)
                .toList();
    }

    public List<CrmLeadDTO> getDeleted() {
        return crmLeadRepository.findByDeletedTrue()
                .stream()
                .map(crmLeadMapper::toDTO)
                .toList();
    }

    private void detectChangesAndLog(CrmLead before, CrmLead after) {

        if (!before.getName().equals(after.getName())) {
            leadHistoryService.log(
                    after,
                    LeadHistoryAction.UPDATED,
                    "name",
                    before.getName() + " → " + after.getName()
            );
        }

        if (!before.getEmail().equals(after.getEmail())) {
            leadHistoryService.log(
                    after,
                    LeadHistoryAction.UPDATED,
                    "email",
                    before.getEmail() + " → " + after.getEmail()
            );
        }

        if (before.getPhone() != null && !before.getPhone().equals(after.getPhone())) {
            leadHistoryService.log(
                    after,
                    LeadHistoryAction.UPDATED,
                    "phone",
                    before.getPhone() + " → " + after.getPhone()
            );
        }

        if (before.getStage() != after.getStage()) {
            leadHistoryService.log(
                    after,
                    LeadHistoryAction.STATUS_CHANGE,
                    "stage",
                    before.getStage().name() + " → " + after.getStage().name()
            );
        }

        if (!before.getTag().equals(after.getTag())) {
            leadHistoryService.log(
                    after,
                    LeadHistoryAction.UPDATED,
                    "tags",
                    before.getTag().toString() + " → " + after.getTag().toString()
            );
        }
    }

}