package com.nocountry.backend.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nocountry.backend.dto.ActionDTO;
import com.nocountry.backend.entity.AutomationExecutionQueue;
import com.nocountry.backend.entity.AutomationRule;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.entity.EmailTemplate;
import com.nocountry.backend.enums.ActionType;
import com.nocountry.backend.enums.ExecutionStatus;
import com.nocountry.backend.enums.TriggerEvent;
import com.nocountry.backend.events.LeadCreatedEvent;
import com.nocountry.backend.repository.AutomationExecutionQueueRepository;
import com.nocountry.backend.repository.AutomationRuleRepository;
import com.nocountry.backend.repository.EmailTemplateRepository;
import com.nocountry.backend.services.whatsapp.WhatsAppApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AutomationExecutionService {

    private final AutomationRuleRepository ruleRepository;
    private final AutomationExecutionQueueRepository queueRepository;
    private final EmailTemplateRepository templateRepository;
    private final EmailService emailService;
    private final WhatsAppApiService whatsAppService;
    private final ObjectMapper objectMapper;

    @EventListener
    @Transactional
    public void handleLeadCreated(LeadCreatedEvent event) {
        CrmLead lead = event.getLead();
        log.info("Lead created event received for lead: {} ({})", lead.getId(), lead.getName());

        // Find all active rules with LEAD_CREATED trigger
        List<AutomationRule> rules = ruleRepository
                .findByTriggerEventAndIsActiveTrue(TriggerEvent.LEAD_CREATED);

        log.info("Found {} active automation rules for LEAD_CREATED", rules.size());

        for (AutomationRule rule : rules) {
            try {
                executeOrSchedule(rule, lead);
            } catch (Exception e) {
                log.error("Error processing rule {} for lead {}: {}",
                        rule.getId(), lead.getId(), e.getMessage());
            }
        }
    }

    private void executeOrSchedule(AutomationRule rule, CrmLead lead) {
        Integer waitDays = rule.getWaitDays() != null ? rule.getWaitDays() : 0;
        Integer waitHours = rule.getWaitHours() != null ? rule.getWaitHours() : 0;
        int totalDelayMinutes = (waitDays * 24 * 60) + (waitHours * 60);

        if (totalDelayMinutes > 0) {
            // Schedule for later execution
            LocalDateTime executeAt = LocalDateTime.now()
                    .plusDays(waitDays)
                    .plusHours(waitHours);

            AutomationExecutionQueue item = AutomationExecutionQueue.builder()
                    .automationRule(rule)
                    .lead(lead)
                    .scheduledAt(executeAt)
                    .status(ExecutionStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .build();
            queueRepository.save(item);
            log.info("Scheduled automation rule '{}' for lead {} at {}",
                    rule.getName(), lead.getId(), executeAt);
        } else {
            // Execute immediately
            log.info("Executing automation rule '{}' immediately for lead {}",
                    rule.getName(), lead.getId());
            executeActions(rule, lead);
        }
    }

    public void executeActions(AutomationRule rule, CrmLead lead) {
        try {
            List<ActionDTO> actions = parseActions(rule.getActions());
            log.info("Executing {} actions for rule '{}'", actions.size(), rule.getName());

            for (ActionDTO action : actions) {
                executeAction(action, lead);
            }
        } catch (Exception e) {
            log.error("Error executing automation rule '{}': {}", rule.getName(), e.getMessage());
            throw e;
        }
    }

    private List<ActionDTO> parseActions(String actionsJson) {
        try {
            if (actionsJson == null || actionsJson.isEmpty()) {
                log.warn("Empty actions JSON");
                return List.of();
            }

            String trimmed = actionsJson.trim();
            log.debug("Parsing actions JSON: {}", trimmed.substring(0, Math.min(200, trimmed.length())));

            // Check if it's an array (starts with '[') or an object (starts with '{')
            if (trimmed.startsWith("[")) {
                // Parse as array directly
                return objectMapper.readValue(actionsJson,
                        new TypeReference<List<ActionDTO>>() {
                        });
            } else if (trimmed.startsWith("{")) {
                // Could be:
                // 1. A wrapper object with "actions" field: {"waitDays":0, "actions":[...]}
                // 2. A single ActionDTO: {"type":"send-email", ...}

                // Try to parse as JsonNode first to inspect structure
                var jsonNode = objectMapper.readTree(actionsJson);

                if (jsonNode.has("actions") && jsonNode.get("actions").isArray()) {
                    // It's a wrapper object, extract the actions array
                    var actionsNode = jsonNode.get("actions");
                    return objectMapper.convertValue(actionsNode,
                            new TypeReference<List<ActionDTO>>() {
                            });
                } else if (jsonNode.has("type")) {
                    // It's a single action object
                    ActionDTO singleAction = objectMapper.treeToValue(jsonNode, ActionDTO.class);
                    return List.of(singleAction);
                } else {
                    log.warn("Unknown JSON object structure, no 'actions' or 'type' field found");
                    return List.of();
                }
            } else {
                log.warn("Invalid actions JSON format: {}",
                        actionsJson.substring(0, Math.min(50, actionsJson.length())));
                return List.of();
            }
        } catch (Exception e) {
            log.error("Error parsing actions JSON: {}", e.getMessage());
            return List.of();
        }
    }

    private void executeAction(ActionDTO action, CrmLead lead) {
        ActionType actionType = action.getActionType();
        if (actionType == null) {
            log.warn("Action type is null or unrecognized: '{}', skipping", action.getType());
            return;
        }

        switch (actionType) {
            case SEND_EMAIL -> sendEmailAction(action, lead);
            case SEND_WHATSAPP -> sendWhatsAppAction(action, lead);
            case CREATE_TASK -> log.info("CREATE_TASK action not yet implemented");
            case MOVE_SEGMENT -> log.info("MOVE_SEGMENT action not yet implemented");
            default -> log.warn("Unsupported action type: {}", actionType);
        }
    }

    private void sendEmailAction(ActionDTO action, CrmLead lead) {
        if (lead.getEmail() == null || lead.getEmail().isEmpty()) {
            log.warn("Lead {} has no email, skipping email action", lead.getId());
            return;
        }

        String subject, body;

        if (action.getTemplateId() != null) {
            EmailTemplate template = templateRepository.findById(action.getTemplateId())
                    .orElseThrow(() -> new RuntimeException("Template not found: " + action.getTemplateId()));
            subject = renderTemplate(template.getSubject(), lead);
            body = renderTemplate(template.getBody(), lead);
        } else {
            subject = renderTemplate(action.getCustomSubject(), lead);
            body = renderTemplate(action.getCustomMessage(), lead);
        }

        try {
            emailService.sendHtmlEmail(lead.getEmail(), subject, body);
            log.info("Email sent to {} via automation", lead.getEmail());
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", lead.getEmail(), e.getMessage());
            throw e;
        }
    }

    private void sendWhatsAppAction(ActionDTO action, CrmLead lead) {
        if (lead.getPhone() == null || lead.getPhone().isEmpty()) {
            log.warn("Lead {} has no phone number, skipping WhatsApp action", lead.getId());
            return;
        }

        String message;

        if (action.getTemplateId() != null) {
            EmailTemplate template = templateRepository.findById(action.getTemplateId())
                    .orElse(null);

            if (template != null) {
                // Prepend title as bold header for WhatsApp
                String header = template.getSubject() != null && !template.getSubject().isEmpty()
                        ? "*" + template.getSubject() + "*\n\n"
                        : "";
                message = header + renderTemplate(template.getBody(), lead);
            } else {
                log.warn("Template {} not found, using default welcome message", action.getTemplateId());
                message = getDefaultWelcomeMessage(lead);
            }
        } else if (action.getCustomMessage() != null && !action.getCustomMessage().isEmpty()) {
            // Custom message
            String header = action.getCustomSubject() != null && !action.getCustomSubject().isEmpty()
                    ? "*" + action.getCustomSubject() + "*\n\n"
                    : "";
            message = header + renderTemplate(action.getCustomMessage(), lead);
        } else {
            // No template or custom message - use default welcome
            log.info("No template or custom message configured, using default welcome message");
            message = getDefaultWelcomeMessage(lead);
        }

        // Ensure message is not empty
        if (message == null || message.trim().isEmpty()) {
            message = getDefaultWelcomeMessage(lead);
        }

        try {
            whatsAppService.sendTextMessage(lead.getPhone(), message);
            log.info("WhatsApp sent to {} via automation", lead.getPhone());
        } catch (Exception e) {
            log.error("Failed to send WhatsApp to {}: {}", lead.getPhone(), e.getMessage());
            throw e;
        }
    }

    private String renderTemplate(String template, CrmLead lead) {
        if (template == null)
            return "";

        return template
                .replace("{{name}}", lead.getName() != null ? lead.getName() : "")
                .replace("{{email}}", lead.getEmail() != null ? lead.getEmail() : "")
                .replace("{{phone}}", lead.getPhone() != null ? lead.getPhone() : "")
                .replace("{{lead.name}}", lead.getName() != null ? lead.getName() : "")
                .replace("{{lead.email}}", lead.getEmail() != null ? lead.getEmail() : "")
                .replace("{{lead.phone}}", lead.getPhone() != null ? lead.getPhone() : "");
    }

    private String getDefaultWelcomeMessage(CrmLead lead) {
        String name = lead.getName() != null && !lead.getName().isEmpty()
                ? lead.getName()
                : "estimado cliente";
        return String.format(
                "*¡Bienvenido/a!* 👋\n\n" +
                        "Hola %s, gracias por contactarnos.\n\n" +
                        "Nos pondremos en contacto contigo pronto. " +
                        "Si tienes alguna pregunta, no dudes en escribirnos.\n\n" +
                        "¡Saludos!",
                name);
    }
}
