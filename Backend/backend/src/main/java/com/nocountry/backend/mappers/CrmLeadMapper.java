package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.CreateCrmLeadDTO;
import com.nocountry.backend.dto.CrmLeadDTO;
import com.nocountry.backend.dto.UpdateCrmLeadDTO;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.entity.Tag;
import org.mapstruct.*;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface CrmLeadMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "NEW")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "tag", ignore = true)
    CrmLead toEntity(CreateCrmLeadDTO dto);

    @Mapping(target = "tagIds", expression = "java(toTagIds(crmLead.getTag()))")
    CrmLeadDTO toDTO(CrmLead crmLead);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateCrmLeadFromDto(UpdateCrmLeadDTO dto, @MappingTarget CrmLead entity);

    // Tags → ids
    default Set<Long> toTagIds(Set<Tag> tags) {
        if (tags == null) return null;
        return tags.stream().map(Tag::getId).collect(Collectors.toSet());
    }
}
