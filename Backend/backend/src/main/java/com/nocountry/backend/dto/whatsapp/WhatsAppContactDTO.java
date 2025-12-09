package com.nocountry.backend.dto.whatsapp;

import com.fasterxml.jackson.annotation.JsonProperty;

public record WhatsAppContactDTO(
        WhatsAppProfileDTO profile,
        @JsonProperty("wa_id") String waId) {
}
