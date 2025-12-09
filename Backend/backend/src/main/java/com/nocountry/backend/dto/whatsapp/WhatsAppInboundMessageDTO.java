package com.nocountry.backend.dto.whatsapp;

public record WhatsAppInboundMessageDTO(
                String from,
                String id,
                String timestamp,
                String type,
                WhatsAppTextDTO text,
                WhatsAppImageDTO image,
                WhatsAppVideoDTO video,
                WhatsAppAudioDTO audio,
                WhatsAppDocumentDTO document,
                WhatsAppStickerDTO sticker) {
}
