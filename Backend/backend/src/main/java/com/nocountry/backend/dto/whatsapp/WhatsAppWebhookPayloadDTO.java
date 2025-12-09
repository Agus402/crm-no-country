package com.nocountry.backend.dto.whatsapp;

import java.util.List;

public record WhatsAppWebhookPayloadDTO(
        String object,
        List<WhatsAppEntryDTO> entry) {
}
