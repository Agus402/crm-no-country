package com.nocountry.backend.services;

import com.nocountry.backend.dto.*;
import com.nocountry.backend.entity.*;
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
public class ContactService {

    private final ContactRepository contactRepository;
    private final TagRepository tagRepository;
    private final ContactMapper contactMapper;

    public ContactDTO create(CreateContactDTO dto) {
        Contact contact = contactMapper.toEntity(dto);

        contact.setCreatedAt(LocalDateTime.now());
        contact.setUpdatedAt(LocalDateTime.now());

        Set<Tag> tags = new HashSet<>(tagRepository.findAllById(dto.tagIds()));
        contact.setTags(tags);

        return contactMapper.toDTO(contactRepository.save(contact));
    }

    public ContactDTO getById(Long id) {
        return contactRepository.findById(id)
                .map(contactMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Contact not found"));
    }
    public ContactDTO update(Long id, UpdateContactDTO dto) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        contact.setName(dto.name());
        contact.setEmail(dto.email());
        contact.setPhone(dto.phone());
        contact.setStage(dto.stage());
        contact.setUpdatedAt(LocalDateTime.now());

        if (dto.tagIds() != null) {
            Set<Tag> tags = new HashSet<>(tagRepository.findAllById(dto.tagIds()));
            contact.setTags(tags);
        }

        return contactMapper.toDTO(contactRepository.save(contact));
    }


    public void delete(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        contactRepository.delete(contact);
    }

    public List<ContactDTO> getAll() {
        return contactRepository.findAll()
                .stream()
                .map(contactMapper::toDTO)
                .toList();
    }


}
