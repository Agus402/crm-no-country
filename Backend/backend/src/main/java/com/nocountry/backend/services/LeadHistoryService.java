package com.nocountry.backend.services;

import com.nocountry.backend.dto.LeadHistoryDTO;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.entity.LeadHistory;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.enums.LeadHistoryAction;
import com.nocountry.backend.mappers.LeadHistoryMapper;
import com.nocountry.backend.repository.LeadHistoryRepository;
import com.nocountry.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeadHistoryService {

    private final LeadHistoryRepository leadHistoryRepository;
    private final LeadHistoryMapper leadHistoryMapper;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName().equalsIgnoreCase("anonymousUser")) {
            throw new RuntimeException("No authenticated user found");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found in DB"));
    }

    public void log(CrmLead lead, LeadHistoryAction action, String attribute, String state) {
        LeadHistory entry = LeadHistory.builder()
                .lead(lead)
                .user(getCurrentUser())
                .action(action)
                .attribute(attribute)
                .state(state)
                .createdAt(LocalDateTime.now())
                .build();

        leadHistoryRepository.save(entry);
    }

    public List<LeadHistoryDTO> getByLead(Long leadId) {
        return leadHistoryRepository.findByLeadIdOrderByCreatedAtDesc(leadId)
                .stream()
                .map(leadHistoryMapper::toDTO)
                .toList();
    }
}
