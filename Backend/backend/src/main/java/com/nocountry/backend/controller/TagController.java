package com.nocountry.backend.controller;

import com.nocountry.backend.dto.*;
import com.nocountry.backend.services.TagService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tag")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @PostMapping
    public TagDTO create(@RequestBody CreateTagDTO dto) {
        return tagService.create(dto);
    }

    @GetMapping
    public List<TagDTO> getAll(@RequestParam(required = false) String name) {

        if (name != null && !name.isBlank()) {
            return tagService.getByName(name);
        }

        return tagService.getAll();
    }

    @GetMapping("/{id}")
    public TagDTO getById(@PathVariable Long id) {
        return tagService.getById(id);
    }

    @PutMapping("/{id}")
    public TagDTO update(@PathVariable Long id, @RequestBody UpdateTagDTO dto) {
        return tagService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        tagService.delete(id);
    }

}
