package com.nocountry.backend.controller;

import com.nocountry.backend.dto.CreateEmailLogDTO;
import com.nocountry.backend.dto.EmailLogDTO;
import com.nocountry.backend.services.EmailLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/email-logs")
@RequiredArgsConstructor
public class EmailLogController {

    private final EmailLogService emailLogService;

    @PostMapping
    public EmailLogDTO create(@RequestBody CreateEmailLogDTO dto) {
        return emailLogService.create(dto);
    }

    @GetMapping("/{id}")
    public EmailLogDTO getById(@PathVariable Long id) {
        return emailLogService.getById(id);
    }

    @GetMapping
    public List<EmailLogDTO> getAll() {
        return emailLogService.getAll();
    }
    @GetMapping("/lead/{leadId}")
    public List<EmailLogDTO> getByLead(@PathVariable Long leadId) {
        return emailLogService.getByLeadId(leadId);
    }

}
