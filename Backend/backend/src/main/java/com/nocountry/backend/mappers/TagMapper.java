package com.nocountry.backend.mappers;

import org.mapstruct.Mapper;
import com.nocountry.backend.dto.*;
import com.nocountry.backend.entity.*;

@Mapper(componentModel = "spring")
public interface TagMapper {

    Tag toEntity(CreateTagDTO dto);

    TagDTO toDTO(Tag tag);
}