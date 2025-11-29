package com.nocountry.backend.services;

import com.nocountry.backend.dto.*;
import com.nocountry.backend.entity.*;
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

    public CrmLeadDTO create(CreateCrmLeadDTO dto) {
        CrmLead crmLead = crmLeadMapper.toEntity(dto);
        crmLead.setCreatedAt(LocalDateTime.now());
        crmLead.setUpdatedAt(LocalDateTime.now());
        Set<Tag> tags = new HashSet<>(tagRepository.findAllById(dto.tagIds()));
        crmLead.setTag(tags);
        return crmLeadMapper.toDTO(crmLeadRepository.save(crmLead));
    }

    public CrmLeadDTO getById(Long id) {
        return crmLeadRepository.findById(id) .map(crmLeadMapper::toDTO) .orElseThrow(() -> new RuntimeException("Crm Lead not found"));
    }

    public CrmLeadDTO update(Long id, UpdateCrmLeadDTO dto) {
        CrmLead crmLead = crmLeadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Crm Lead not found"));

        crmLeadMapper.updateCrmLeadFromDto(dto, crmLead);

        if (dto.tagIds() != null) {
            crmLead.setTag(new HashSet<>(tagRepository.findAllById(dto.tagIds())));
        }

        crmLead.setUpdatedAt(LocalDateTime.now());

        return crmLeadMapper.toDTO(crmLeadRepository.save(crmLead));
    }


    public void delete(Long id) {
        CrmLead crmLead = crmLeadRepository.findById(id) .orElseThrow(() -> new RuntimeException("Crm Lead not found"));
        crmLeadRepository.delete(crmLead);
    }

    public List<CrmLeadDTO> getAll(String name, String email, Stage stage) {

        List<CrmLead> crmLeads;

        boolean hasName = name != null && !name.isBlank();
        boolean hasEmail = email != null && !email.isBlank();
        boolean hasStage = stage != null;

        if (hasStage) {

            if (hasName) {
                crmLeads = crmLeadRepository
                        .findByNameContainingIgnoreCaseAndStage(name, stage);

            } else if (hasEmail) {
                crmLeads = crmLeadRepository
                        .findByEmailContainingIgnoreCaseAndStage(email, stage);

            } else {
                crmLeads = crmLeadRepository
                        .findByStage(stage);
            }

        } else {
            // No stage, búsqueda libre
            if (hasName) {
                crmLeads = crmLeadRepository
                        .findByNameContainingIgnoreCase(name);

            } else if (hasEmail) {
                crmLeads = crmLeadRepository
                        .findByEmailContainingIgnoreCase(email);

            } else {
                crmLeads = crmLeadRepository.findAll();
            }
        }

        return crmLeads.stream()
                .map(crmLeadMapper::toDTO)
                .toList();
    }

}