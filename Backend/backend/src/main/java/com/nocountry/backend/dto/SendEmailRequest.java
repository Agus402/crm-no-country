package com.nocountry.backend.dto;

import java.util.Map;

public record SendEmailRequest(
        Long leadId,
        Long templateId,
        String subject,
        String body,
        Map<String, String> templateVars // variables para reemplazar {{name}}, etc.
) {}
