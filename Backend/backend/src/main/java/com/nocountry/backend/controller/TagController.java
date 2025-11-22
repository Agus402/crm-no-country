package com.nocountry.backend.controller;

import com.nocountry.backend.dto.*;
import com.nocountry.backend.services.TagService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @PostMapping
    public TagDTO create(@RequestBody CreateTagDTO dto) {
        return tagService.create(dto);
    }
}
