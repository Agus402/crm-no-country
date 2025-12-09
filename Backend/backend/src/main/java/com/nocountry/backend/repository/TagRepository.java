package com.nocountry.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.nocountry.backend.entity.Tag;

import java.util.List;

public interface TagRepository extends JpaRepository<Tag, Long> {
    List<Tag> findByNameContainingIgnoreCase(String name);
    boolean existsById(Long id);
    boolean existsByNameIgnoreCase(String name);


}
