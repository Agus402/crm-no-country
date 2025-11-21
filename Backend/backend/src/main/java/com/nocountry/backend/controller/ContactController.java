package com.nocountry.backend.controller;

import com.nocountry.backend.dto.*;
import com.nocountry.backend.services.ContactService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ContactDTO create(@Valid @RequestBody CreateContactDTO dto) {
        return contactService.create(dto);
    }


    @GetMapping("/{id}")
    public ContactDTO getById(@PathVariable Long id) {
        return contactService.getById(id);
    }

    @PutMapping("/{id}")
    public ContactDTO update(@PathVariable Long id, @RequestBody UpdateContactDTO dto) {
        return contactService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        contactService.delete(id);
    }

    @GetMapping
    public List<ContactDTO> getAll() {
        return contactService.getAll();
    }

}
