package com.nocountry.backend.dto.whatsapp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record WhatsAppAudioDTO(
        String id,
        @JsonProperty("mime_type") String mimeType,
        String sha256) {
}
