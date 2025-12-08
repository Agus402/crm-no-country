package com.nocountry.backend.dto;

import com.nocountry.backend.enums.EmailTemplateType;

public record EmailTemplateDTO(
        Long id,
        String name,
        String subject,
        String body,
        EmailTemplateType type
) {}
