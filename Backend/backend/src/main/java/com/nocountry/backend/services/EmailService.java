package com.nocountry.backend.services;

import com.nocountry.backend.dto.SendEmailRequest;
import com.nocountry.backend.entity.*;
import com.nocountry.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final EmailTemplateRepository emailTemplateRepository;
    private final CrmLeadRepository crmLeadRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    
    // JavaMailSender es opcional - solo estará disponible si hay credenciales configuradas
    // Esto permite que la aplicación arranque sin credenciales de email
    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    /**
     * Enviar email; si viene templateId usa esa plantilla (sino usa subject/body).
     * Luego registra un Message y actualiza o crea Conversation.
     */
    @Transactional
    public void sendEmail(SendEmailRequest request) {

        CrmLead lead = crmLeadRepository.findById(request.leadId())
                .orElseThrow(() -> new RuntimeException("Lead not found: " + request.leadId()));

        String authName = SecurityContextHolder.getContext().getAuthentication().getName();
        User sender = userRepository.findByEmail(authName)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + authName));

        String subject;
        String body;
        EmailTemplate template = null;

        if (request.templateId() != null) {
            template = emailTemplateRepository.findById(request.templateId())
                    .orElseThrow(() -> new RuntimeException("Template not found: " + request.templateId()));
            subject = template.getSubject() != null ? template.getSubject() : request.subject();
            body = template.getBody();
        } else {
            subject = request.subject();
            body = request.body();
            if (body == null)
                throw new RuntimeException("Either templateId or body must be provided");
        }

        Map<String, String> vars = request.templateVars() == null ? Map.of() : request.templateVars();
        String renderedBody = renderTemplate(body, lead, vars);
        String renderedSubject = subject != null ? renderTemplate(subject, lead, vars) : "";

        sendHtmlEmail(lead.getEmail(), renderedSubject, renderedBody);

        Conversation conversation = conversationRepository.findFirstByCrmLead(lead)
                .orElseGet(() -> {
                    Conversation c = Conversation.builder()
                            .crm_lead(lead)
                            .channel(com.nocountry.backend.enums.Channel.EMAIL)
                            .assignedUser(lead.getOwner())
                            .startedAt(LocalDateTime.now())
                            .lastMessageAt(LocalDateTime.now())
                            .lastMessageText(
                                    renderedBody.length() > 200 ? renderedBody.substring(0, 200) : renderedBody)
                            .lastMessageDirection(com.nocountry.backend.enums.Direction.OUTBOUND)
                            .status(com.nocountry.backend.enums.ConversationStatus.OPEN)
                            .build();
                    return conversationRepository.save(c);
                });

        conversation.setLastMessageAt(LocalDateTime.now());
        conversation.setLastMessageText(renderedBody.length() > 200 ? renderedBody.substring(0, 200) : renderedBody);
        conversation.setLastMessageDirection(com.nocountry.backend.enums.Direction.OUTBOUND);
        conversationRepository.save(conversation);

        Message message = Message.builder()
                .conversation(conversation)
                .senderType(com.nocountry.backend.enums.SenderType.USER)
                .senderLeadId(null)
                .messageDirection(com.nocountry.backend.enums.Direction.OUTBOUND)
                .messageType(com.nocountry.backend.enums.MessageType.EMAIL)
                .content(renderedBody)
                .externalMessageId(null)
                .sentAt(LocalDateTime.now())
                .emailTemplate(template)
                .build();

        messageRepository.save(message);
    }

    /**
     * Envía un email HTML a la dirección especificada.
     * Método público para uso desde otros servicios como MessageService.
     */
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        sendHtmlEmail(to, subject, htmlBody, null, null);
    }

    /**
     * Envía un email HTML con soporte para threading (In-Reply-To y References).
     * 
     * @param to         Dirección de destino
     * @param subject    Asunto del email
     * @param htmlBody   Contenido HTML
     * @param inReplyTo  Message-ID del email al que se responde (puede ser null)
     * @param references Lista de Message-IDs del thread (puede ser null)
     */
    public void sendHtmlEmail(String to, String subject, String htmlBody, String inReplyTo, String references) {
        if (javaMailSender == null) {
            throw new RuntimeException(
                "Email service is not configured. " +
                "Please configure email credentials in Settings > Integrations > Email, " +
                "or set spring.mail.username and spring.mail.password in application.properties"
            );
        }
        
        try {
            MimeMessage mime = javaMailSender.createMimeMessage();

            // Agregar headers de threading si existen
            if (inReplyTo != null && !inReplyTo.isEmpty()) {
                mime.setHeader("In-Reply-To", inReplyTo);
            }
            if (references != null && !references.isEmpty()) {
                mime.setHeader("References", references);
            }

            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject == null ? "" : subject);
            helper.setText(htmlBody == null ? "" : htmlBody, true);
            javaMailSender.send(mime);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    private String renderTemplate(String template, CrmLead lead, Map<String, String> vars) {
        if (template == null)
            return "";

        String out = template;

        // Atajos del lead
        if (lead != null) {
            out = out.replace("{{name}}", safe(lead.getName()));
            out = out.replace("{{lead.name}}", safe(lead.getName()));
            out = out.replace("{{email}}", safe(lead.getEmail()));
            out = out.replace("{{lead.email}}", safe(lead.getEmail()));
            out = out.replace("{{phone}}", safe(lead.getPhone()));
        }

        // Variables custom
        for (Map.Entry<String, String> e : vars.entrySet()) {
            out = out.replace("{{" + e.getKey() + "}}", safe(e.getValue()));
        }

        return out;
    }

    private String safe(Object o) {
        return o == null ? "" : String.valueOf(o);
    }
}
