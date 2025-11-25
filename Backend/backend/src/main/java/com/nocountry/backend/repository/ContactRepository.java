package com.nocountry.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.nocountry.backend.entity.Contact;
public interface ContactRepository extends JpaRepository<Contact, Long> {
}
