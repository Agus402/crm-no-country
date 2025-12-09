package com.nocountry.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record WhatsAppOutboundRequestDTO(

        @JsonProperty("recipient_type")
        String recipientType,

        @JsonProperty("to")
        String to, // Número de teléfono del Lead con código de país (ej: 54911xxxx)

        @JsonProperty("type")
        String type,

        @JsonProperty("text")
        WhatsAppTextComponentDTO text // El contenido del mensaje

) {
}
