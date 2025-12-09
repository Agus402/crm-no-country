package com.nocountry.backend.dto;

/**
 * DTO para notificaciones WebSocket de mensajes nuevos.
 * Se envía a los clientes suscritos cuando hay actualizaciones.
 */
public record WebSocketMessageDTO(
        String type, // "NEW_MESSAGE" | "MESSAGE_SENT" | "CONVERSATION_UPDATED"
        Long conversationId,
        MessageDTO message,
        ConversationDTO conversation) {
}
