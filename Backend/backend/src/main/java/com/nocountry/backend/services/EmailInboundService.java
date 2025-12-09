package com.nocountry.backend.services;

import com.nocountry.backend.entity.Conversation;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.entity.Message;
import com.nocountry.backend.enums.Direction;
import com.nocountry.backend.enums.MessageType;
import com.nocountry.backend.enums.SenderType;
import com.nocountry.backend.repository.ConversationRepository;
import com.nocountry.backend.repository.CrmLeadRepository;
import com.nocountry.backend.repository.MessageRepository;
import com.nocountry.backend.services.email.EmailConfigService;
import com.nocountry.backend.services.email.EmailConfigService.EmailCredentials;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.search.FlagTerm;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Properties;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailInboundService {

    private final CrmLeadRepository leadRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final EmailConfigService emailConfigService;

    /**
     * Corre cada 1 minuto. Lee correos nuevos y los guarda como Message.
     */
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void checkInbox() {
        // Obtener credenciales dinámicamente
        EmailCredentials credentials = emailConfigService.getEmailCredentials().orElse(null);
        if (credentials == null || !credentials.isValid()) {
            log.debug("Email not configured, skipping inbox check");
            return;
        }

        try {
            Properties props = new Properties();
            props.put("mail.store.protocol", "imap");
            props.put("mail.imap.ssl.enable", "true");

            Session session = Session.getInstance(props);
            Store store = session.getStore();
            store.connect(credentials.imapHost(), credentials.imapPort(), credentials.username(),
                    credentials.password());

            String folderName = credentials.folderName() != null ? credentials.folderName() : "INBOX";
            Folder folder = store.getFolder(folderName);
            folder.open(Folder.READ_WRITE);

            jakarta.mail.Message[] messages = folder.search(new FlagTerm(new Flags(Flags.Flag.SEEN), false));

            for (jakarta.mail.Message mail : messages) {
                processInboundEmail(mail);
                mail.setFlag(Flags.Flag.SEEN, true);
            }

            folder.close(false);
            store.close();

        } catch (Exception e) {
            log.error("ERROR reading IMAP: {}", e.getMessage());
        }
    }

    private void processInboundEmail(jakarta.mail.Message mail) throws Exception {
        String from = ((InternetAddress) mail.getFrom()[0]).getAddress();
        String subject = mail.getSubject();
        String rawContent = extractContent(mail);

        String cleanedContent = cleanHtml(rawContent);

        String content = cleanReply(cleanedContent);

        CrmLead lead = leadRepository.findByEmailIgnoreCase(from)
                .orElse(null);

        if (lead == null) {
            System.out.println("Inbound email ignored, does not match any lead: " + from);
            return;
        }

        Conversation conversation = conversationRepository.findFirstByCrmLead(lead)
                .orElseGet(() -> conversationRepository.save(
                        Conversation.builder()
                                .crm_lead(lead)
                                .channel(com.nocountry.backend.enums.Channel.EMAIL)
                                .assignedUser(lead.getOwner())
                                .startedAt(LocalDateTime.now())
                                .status(com.nocountry.backend.enums.ConversationStatus.OPEN)
                                .build()));

        Message inbound = Message.builder()
                .conversation(conversation)
                .senderType(SenderType.LEAD)
                .senderLeadId(lead.getId())
                .messageDirection(Direction.INBOUND)
                .messageType(MessageType.EMAIL)
                .content(content)
                .sentAt(LocalDateTime.now())
                .build();

        messageRepository.save(inbound);

        conversation.setLastMessageAt(LocalDateTime.now());
        conversation.setLastMessageText(content.substring(0, Math.min(content.length(), 200)));
        conversation.setLastMessageDirection(Direction.INBOUND);
        conversationRepository.save(conversation);
    }

    private String extractContent(Part part) throws Exception {
        if (part.isMimeType("text/plain")) {
            return (String) part.getContent();
        }
        if (part.isMimeType("text/html")) {
            return (String) part.getContent();
        }
        if (part.isMimeType("multipart/*")) {
            Multipart mp = (Multipart) part.getContent();
            for (int i = 0; i < mp.getCount(); i++) {
                BodyPart bp = mp.getBodyPart(i);
                String result = extractContent(bp);
                if (result != null && !result.isBlank()) {
                    return result;
                }
            }
        }
        return "";
    }

    private String cleanHtml(String rawHtml) {
        if (rawHtml == null)
            return "";
        return Jsoup.parse(rawHtml).text().trim();
    }

    private String cleanReply(String raw) {
        if (raw == null)
            return "";

        String cleaned = raw.replaceAll("[\\u00A0\\u2007\\u202F]+", " ").trim();

        String[] simpleSplitters = {
                "escribió:",
                "wrote:",
                "Sent from my iPhone",
                "Enviado desde mi iPhone",
                "Enviado desde mi Android"
        };

        for (String splitter : simpleSplitters) {
            int idx = cleaned.lastIndexOf(splitter);
            if (idx > 0) {
                cleaned = cleaned.substring(0, idx).trim();
            }
        }

        String regexGmail = "(?i)(?:El|On)\\s+.+?\\d{4}.*?(?:a\\s+la\\(s\\)|at)\\s+\\d{1,2}:\\d{2}.*";

        cleaned = cleaned.replaceAll("(?s)" + regexGmail, "").trim();

        cleaned = cleaned.replaceAll("(?i)el\\s+\\w{3},?\\s+\\d{1,2}\\s+\\w{3}.*$", "").trim();

        return cleaned;
    }
}