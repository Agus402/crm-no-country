package com.nocountry.backend.controller;

import com.nocountry.backend.dto.LeadHistoryDTO;
import com.nocountry.backend.services.LeadHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lead-history")
@RequiredArgsConstructor
public class LeadHistoryController {

    private final LeadHistoryService leadHistoryService;

    @GetMapping("/{leadId}")
    public List<LeadHistoryDTO> getHistory(@PathVariable Long leadId) {
        return leadHistoryService.getByLead(leadId);
    }
}
