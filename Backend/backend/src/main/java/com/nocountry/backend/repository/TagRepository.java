package com.nocountry.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.nocountry.backend.entity.Tag;

public interface TagRepository extends JpaRepository<Tag, Long> {
}
