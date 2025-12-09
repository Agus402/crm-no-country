package com.nocountry.backend.controller;

import com.nocountry.backend.dto.ConversationDTO;
import com.nocountry.backend.dto.CreateConversationDTO;
import com.nocountry.backend.dto.MessageDTO;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.services.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user.getId();
        }
        throw new IllegalStateException("Unauthenticated user");
    }

    // POST /api/conversations: CREAR (Iniciar) una nueva conversación
    @PostMapping
    public ResponseEntity<ConversationDTO> createConversation(@RequestBody CreateConversationDTO createDto) {
        ConversationDTO newConversation = conversationService.createConversation(createDto);
        return new ResponseEntity<>(newConversation, HttpStatus.CREATED);
    }

    // GET /api/conversations: LEER (Listar todas las conversaciones)
    @GetMapping
    public ResponseEntity<List<ConversationDTO>> getAllConversations() {
        List<ConversationDTO> conversations = conversationService.findAllConversations();
        return ResponseEntity.ok(conversations);
    }

    // GET /api/conversations/{id}: LEER (Obtener conversación por ID)
    @GetMapping("/{id}")
    public ResponseEntity<ConversationDTO> getConversationById(@PathVariable Long id) {
        ConversationDTO conversation = conversationService.findConversationById(id);
        return ResponseEntity.ok(conversation);
    }

    // GET /api/conversations/{id}/messages: LEER (Obtener mensajes de una
    // conversación)
    @GetMapping("/{id}/messages")
    public List<MessageDTO> getMessages(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return conversationService.getConversationMessages(id, userId);
    }

    // DELETE /api/conversations/{id}: ELIMINAR (Cerrar o archivar)
    // Nota: Esto a menudo se maneja como un UPDATE de status=CLOSED
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        conversationService.deleteConversation(id);
        return ResponseEntity.noContent().build();
    }
}
