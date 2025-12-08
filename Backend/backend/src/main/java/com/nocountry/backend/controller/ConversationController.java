package com.nocountry.backend.controller;

import com.nocountry.backend.dto.MessageDTO;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.services.ConversationService;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/{id}/messages")
    public List<MessageDTO> getMessages(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return conversationService.getConversationMessages(id, userId);
    }
}

