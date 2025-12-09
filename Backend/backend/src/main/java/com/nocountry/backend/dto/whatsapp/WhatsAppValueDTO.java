package com.nocountry.backend.dto.whatsapp;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record WhatsAppValueDTO(
        @JsonProperty("messaging_product") String messagingProduct,

        WhatsAppMetadataDTO metadata,

        List<WhatsAppContactDTO> contacts,

        List<WhatsAppInboundMessageDTO> messages,

        List<Object> statuses) {
}
