package com.nocountry.backend.dto;

import com.nocountry.backend.enums.ActionType;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ActionDTO {
    @JsonAlias({ "type", "actionType" })
    private String type;

    private Long templateId; // If using template
    private String customSubject; // If custom message (title/header)
    private String customMessage; // If custom message (body)

    /**
     * Get ActionType enum from the string type field.
     * Handles both formats: "SEND_EMAIL" and "send-email"
     */
    public ActionType getActionType() {
        if (type == null || type.isEmpty()) {
            return null;
        }

        // Normalize: "send-email" -> "SEND_EMAIL"
        String normalized = type.toUpperCase().replace("-", "_");

        try {
            return ActionType.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
