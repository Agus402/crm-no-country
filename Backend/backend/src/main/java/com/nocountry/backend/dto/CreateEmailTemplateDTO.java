package com.nocountry.backend.dto;

import com.nocountry.backend.enums.EmailTemplateType;

public record CreateEmailTemplateDTO(
        String name,
        String subject,
        String body,
        EmailTemplateType type
) {}
