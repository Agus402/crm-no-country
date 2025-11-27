package com.nocountry.backend.services;

import com.nocountry.backend.dto.*;
import com.nocountry.backend.entity.Tag;
import com.nocountry.backend.mappers.TagMapper;
import com.nocountry.backend.repository.TagRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final TagMapper tagMapper;

    public TagDTO create(CreateTagDTO dto) {
        Tag tag = tagMapper.toEntity(dto);
        return tagMapper.toDTO(tagRepository.save(tag));
    }

    public TagDTO getById(Long id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found"));

        return tagMapper.toDTO(tag);
    }

    public List<TagDTO> getAll() {
        return tagRepository.findAll()
                .stream()
                .map(tagMapper::toDTO)
                .toList();
    }

    public List<TagDTO> getByName(String name) {
        return tagRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(tagMapper::toDTO)
                .toList();
    }

    public TagDTO update(Long id, UpdateTagDTO dto) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found"));

        if (dto.name() != null) tag.setName(dto.name());
        if (dto.color() != null) tag.setColor(dto.color());

        return tagMapper.toDTO(tagRepository.save(tag));
    }

    public void delete(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new RuntimeException("Tag not found");
        }
        tagRepository.deleteById(id);
    }


}
