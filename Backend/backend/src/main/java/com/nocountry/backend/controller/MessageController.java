package com.nocountry.backend.controller;

import com.nocountry.backend.dto.MessageDTO;
import com.nocountry.backend.dto.CreateMessageDTO;
import com.nocountry.backend.services.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    // POST /api/messages: CREAR (Enviar) un nuevo mensaje OUTBOUND
    @PostMapping
    // ¡NO NECESITA @PreAuthorize! La regla .anyRequest().authenticated() ya lo protege.
    public ResponseEntity<MessageDTO> createMessage(@RequestBody CreateMessageDTO createDto) {

        MessageDTO newMessage = messageService.createOutboundMessage(createDto);
        return new ResponseEntity<>(newMessage, HttpStatus.CREATED);
    }

    // GET /api/messages?conversationId={id}: LEER (Obtener mensajes de una conversación)
    @GetMapping
    public ResponseEntity<List<MessageDTO>> getMessagesByConversation(
            @RequestParam Long conversationId) {

        List<MessageDTO> messages = messageService.findMessagesByConversationId(conversationId);
        return ResponseEntity.ok(messages);
    }
}