package com.nocountry.backend.controller;

import com.nocountry.backend.dto.*;
import com.nocountry.backend.enums.EmailTemplateType;
import com.nocountry.backend.services.EmailTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/email-templates")
@RequiredArgsConstructor
public class EmailTemplateController {

    private final EmailTemplateService service;

    @PostMapping
    public ResponseEntity<EmailTemplateDTO> create(@RequestBody CreateEmailTemplateDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<EmailTemplateDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailTemplateDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmailTemplateDTO> update(
            @PathVariable Long id,
            @RequestBody UpdateEmailTemplateDTO dto
    ) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/type/{type}")
    public EmailTemplateDTO findByType(@PathVariable EmailTemplateType type) {
        return service.findByType(type);
    }
}