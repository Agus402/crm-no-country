package com.nocountry.backend.services;

import com.nocountry.backend.dto.CreateEmailLogDTO;
import com.nocountry.backend.dto.EmailLogDTO;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.entity.EmailLog;
import com.nocountry.backend.mappers.EmailLogMapper;
import com.nocountry.backend.repository.CrmLeadRepository;
import com.nocountry.backend.repository.EmailLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailLogService {

    private final EmailLogRepository emailLogRepository;
    private final CrmLeadRepository crmLeadRepository;
    private final EmailLogMapper emailLogMapper;

    public EmailLogDTO create(CreateEmailLogDTO dto) {

        CrmLead lead = crmLeadRepository.findById(dto.leadId())
                .orElseThrow(() -> new RuntimeException("Lead not found"));

        EmailLog emailLog = emailLogMapper.toEntity(dto, lead);
        emailLog.setCreatedAt(LocalDateTime.now());

        return emailLogMapper.toDTO(emailLogRepository.save(emailLog));
    }

    public EmailLogDTO getById(Long id) {
        return emailLogRepository.findById(id)
                .map(emailLogMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Email log not found"));
    }

    public List<EmailLogDTO> getAll() {
        return emailLogRepository.findAll()
                .stream()
                .map(emailLogMapper::toDTO)
                .toList();
    }
    public List<EmailLogDTO> getByLeadId(Long leadId) {
        return emailLogRepository.findByLeadId(leadId)
                .stream()
                .map(emailLogMapper::toDTO)
                .toList();
    }

}
