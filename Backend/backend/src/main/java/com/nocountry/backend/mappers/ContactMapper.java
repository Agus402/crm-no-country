package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.ContactDTO;
import com.nocountry.backend.dto.CreateContactDTO;
import com.nocountry.backend.entity.Contact;
import com.nocountry.backend.entity.Tag;
import org.mapstruct.*;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ContactMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "NEW") 
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastContactedAt", ignore = true)
    @Mapping(target = "tags", ignore = true) 
    Contact toEntity(CreateContactDTO dto);

    @Mapping(target = "tagIds", expression = "java(toTagIds(contact.getTags()))")
    ContactDTO toDTO(Contact contact);

 
    default Set<Long> toTagIds(Set<Tag> tags) {
        if (tags == null) return null;
        return tags.stream().map(Tag::getId).collect(Collectors.toSet());
    }
}
