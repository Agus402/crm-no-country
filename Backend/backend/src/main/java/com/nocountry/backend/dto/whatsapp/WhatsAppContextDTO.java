package com.nocountry.backend.dto.whatsapp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for WhatsApp message context (quoted/reply messages)
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record WhatsAppContextDTO(
        String from,
        String id,
        @JsonProperty("message_id") String messageId) {
}
