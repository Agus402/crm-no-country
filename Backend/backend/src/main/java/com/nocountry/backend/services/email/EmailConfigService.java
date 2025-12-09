package com.nocountry.backend.services.email;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nocountry.backend.entity.IntegrationConfig;
import com.nocountry.backend.enums.IntegrationType;
import com.nocountry.backend.repository.IntegrationConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Servicio para obtener las credenciales de Email (SMTP/IMAP)
 * desde la base de datos (IntegrationConfig) o variables de entorno como
 * fallback.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EmailConfigService {

    private final IntegrationConfigRepository configRepository;
    private final ObjectMapper objectMapper;

    // Fallback a variables de entorno
    @Value("${spring.mail.host:smtp.gmail.com}")
    private String envSmtpHost;

    @Value("${spring.mail.port:587}")
    private Integer envSmtpPort;

    @Value("${mail.imap.host:imap.gmail.com}")
    private String envImapHost;

    @Value("${mail.imap.port:993}")
    private Integer envImapPort;

    @Value("${mail.imap.username:}")
    private String envUsername;

    @Value("${mail.imap.password:}")
    private String envPassword;

    @Value("${mail.imap.folder:INBOX}")
    private String envFolderName;

    /**
     * DTO interno para las credenciales de Email
     */
    public record EmailCredentials(
            String smtpHost,
            Integer smtpPort,
            String imapHost,
            Integer imapPort,
            String username,
            String password,
            String folderName) {

        public boolean isValid() {
            return username != null && !username.isBlank()
                    && password != null && !password.isBlank();
        }
    }

    /**
     * Obtiene las credenciales de Email.
     * Primero intenta desde la base de datos, si no hay, usa variables de entorno.
     * 
     * @return Optional con las credenciales
     */
    public Optional<EmailCredentials> getEmailCredentials() {
        // Intentar desde DB primero
        Optional<EmailCredentials> dbCredentials = configRepository.findByIntegrationType(IntegrationType.EMAIL)
                .filter(IntegrationConfig::isConnected)
                .map(this::parseCredentials)
                .filter(EmailCredentials::isValid);

        if (dbCredentials.isPresent()) {
            log.debug("Using email credentials from database");
            return dbCredentials;
        }

        // Fallback a variables de entorno
        if (envUsername != null && !envUsername.isBlank() && envPassword != null && !envPassword.isBlank()) {
            log.debug("Using email credentials from environment variables");
            return Optional.of(new EmailCredentials(
                    envSmtpHost,
                    envSmtpPort,
                    envImapHost,
                    envImapPort,
                    envUsername,
                    envPassword,
                    envFolderName));
        }

        log.warn("No email credentials available (neither in DB nor environment)");
        return Optional.empty();
    }

    /**
     * Verifica si hay una configuración de Email activa.
     */
    public boolean isConfigured() {
        return getEmailCredentials()
                .map(EmailCredentials::isValid)
                .orElse(false);
    }

    /**
     * Verifica si las credenciales vienen de la base de datos.
     */
    public boolean isUsingDatabaseConfig() {
        return configRepository.findByIntegrationType(IntegrationType.EMAIL)
                .filter(IntegrationConfig::isConnected)
                .map(this::parseCredentials)
                .filter(EmailCredentials::isValid)
                .isPresent();
    }

    private EmailCredentials parseCredentials(IntegrationConfig config) {
        if (config.getCredentials() == null || config.getCredentials().isBlank()) {
            log.warn("Email credentials JSON is empty");
            return new EmailCredentials(null, null, null, null, null, null, null);
        }

        try {
            return objectMapper.readValue(config.getCredentials(), EmailCredentials.class);
        } catch (JsonProcessingException e) {
            log.error("Error parsing Email credentials JSON: {}", e.getMessage());
            return new EmailCredentials(null, null, null, null, null, null, null);
        }
    }
}
