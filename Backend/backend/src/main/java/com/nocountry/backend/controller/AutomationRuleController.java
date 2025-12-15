package com.nocountry.backend.controller;

import com.nocountry.backend.dto.AssignContactsDTO;
import com.nocountry.backend.dto.AutomationRuleDTO;
import com.nocountry.backend.dto.CreateUpdateAutomationRuleDTO;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.services.AutomationRuleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/automation-rules")
@RequiredArgsConstructor
// Asumo que solo usuarios autenticados (y quizás con rol ADMIN) pueden manejar
// reglas
@PreAuthorize("isAuthenticated()")
public class AutomationRuleController {

    private final AutomationRuleService ruleService;

    // Método auxiliar para obtener el ID del usuario logueado
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return user.getId();
        }
        throw new IllegalStateException("Usuario no autenticado");
    }

    // C: Crear
    @PostMapping
    // Generalmente, solo el ADMIN o el dueño de la cuenta puede crear reglas
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AutomationRuleDTO> create(@Valid @RequestBody CreateUpdateAutomationRuleDTO dto) {
        Long creatorId = getCurrentUserId();
        AutomationRuleDTO newRule = ruleService.createRule(dto, creatorId);
        return new ResponseEntity<>(newRule, HttpStatus.CREATED);
    }

    // R: Obtener todos
    @GetMapping
    public ResponseEntity<List<AutomationRuleDTO>> getAll() {
        // Podrías agregar lógica aquí para filtrar por reglas de la cuenta del usuario
        return ResponseEntity.ok(ruleService.findAll());
    }

    // R: Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<AutomationRuleDTO> getById(@PathVariable Long id) {
        // Se recomienda agregar lógica de seguridad para verificar la propiedad de la
        // regla
        return ResponseEntity.ok(ruleService.findById(id));
    }

    // U: Actualizar
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AutomationRuleDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateUpdateAutomationRuleDTO dto) {

        AutomationRuleDTO updatedRule = ruleService.updateRule(id, dto);
        return ResponseEntity.ok(updatedRule);
    }

    // D: Eliminar
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        ruleService.deleteRule(id);
    }

    // Assign contacts to an automation rule
    @PostMapping("/{id}/contacts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> assignContacts(
            @PathVariable Long id,
            @RequestBody AssignContactsDTO dto) {
        ruleService.assignContacts(id, dto.getContactIds());
        return ResponseEntity.ok().build();
    }

    // Get assigned contacts for an automation rule
    @GetMapping("/{id}/contacts")
    public ResponseEntity<Map<String, List<Long>>> getAssignedContacts(@PathVariable Long id) {
        List<Long> contactIds = ruleService.getAssignedContacts(id);
        return ResponseEntity.ok(Map.of("contactIds", contactIds));
    }

}
