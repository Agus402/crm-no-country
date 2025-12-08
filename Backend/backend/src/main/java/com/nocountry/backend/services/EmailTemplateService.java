package com.nocountry.backend.services;

import com.nocountry.backend.dto.*;
import com.nocountry.backend.entity.EmailTemplate;
import com.nocountry.backend.enums.EmailTemplateType;
import com.nocountry.backend.mappers.EmailTemplateMapper;
import com.nocountry.backend.repository.EmailTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailTemplateService {

    private final EmailTemplateRepository repository;
    private final EmailTemplateMapper mapper;

    public EmailTemplateDTO create(CreateEmailTemplateDTO dto) {

        if (repository.existsByNameIgnoreCase(dto.name())) {
            throw new RuntimeException("An email template with this name already exists");
        }

        EmailTemplate entity = mapper.toEntity(dto);
        return mapper.toDTO(repository.save(entity));
    }

    public List<EmailTemplateDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    public EmailTemplateDTO getById(Long id) {
        EmailTemplate entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("EmailTemplate not found"));

        return mapper.toDTO(entity);
    }

    public EmailTemplateDTO update(Long id, UpdateEmailTemplateDTO dto) {

        EmailTemplate entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("EmailTemplate not found"));

        mapper.updateEntityFromDto(dto, entity);

        return mapper.toDTO(repository.save(entity));
    }

    public void delete(Long id) {
        EmailTemplate entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("EmailTemplate not found"));

        repository.delete(entity);
    }
    public EmailTemplateDTO findByType(EmailTemplateType type) {
        return repository.findByType(type)
                .map(mapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Template not found for type: " + type));
    }
}