package com.nocountry.backend.dto;

import com.nocountry.backend.enums.EmailTemplateType;

public record UpdateEmailTemplateDTO(
        String name,
        String subject,
        String body,
        EmailTemplateType type
) {}
