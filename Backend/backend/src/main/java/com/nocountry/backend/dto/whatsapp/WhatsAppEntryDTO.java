package com.nocountry.backend.dto.whatsapp;

import java.util.List;

public record WhatsAppEntryDTO(
        String id,
        List<WhatsAppChangeDTO> changes) {
}
