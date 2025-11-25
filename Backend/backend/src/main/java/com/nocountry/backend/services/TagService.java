package com.nocountry.backend.services;

import com.nocountry.backend.dto.*;
import com.nocountry.backend.entity.Tag;
import com.nocountry.backend.mappers.TagMapper;
import com.nocountry.backend.repository.TagRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final TagMapper tagMapper;

    public TagDTO create(CreateTagDTO dto) {
        Tag tag = tagMapper.toEntity(dto);
        return tagMapper.toDTO(tagRepository.save(tag));
    }
}
