package com.nocountry.backend.services.whatsapp;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nocountry.backend.entity.IntegrationConfig;
import com.nocountry.backend.enums.IntegrationType;
import com.nocountry.backend.repository.IntegrationConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Servicio para obtener las credenciales de WhatsApp Cloud API
 * desde la base de datos (IntegrationConfig).
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class WhatsAppConfigService {

    private final IntegrationConfigRepository configRepository;
    private final ObjectMapper objectMapper;

    /**
     * DTO interno para las credenciales de WhatsApp
     */
    public record WhatsAppCredentials(
            String apiToken,
            String baseUrl,
            String verifyToken) {
        public boolean isValid() {
            return apiToken != null && !apiToken.isBlank()
                    && baseUrl != null && !baseUrl.isBlank();
        }
    }

    /**
     * Obtiene las credenciales de WhatsApp desde la base de datos.
     * 
     * @return Optional con las credenciales, vacío si no existe configuración
     */
    public Optional<WhatsAppCredentials> getWhatsAppCredentials() {
        return configRepository.findByIntegrationType(IntegrationType.WHATSAPP)
                .filter(IntegrationConfig::isConnected)
                .map(this::parseCredentials);
    }

    /**
     * Verifica si hay una configuración de WhatsApp activa.
     */
    public boolean isConfigured() {
        return getWhatsAppCredentials()
                .map(WhatsAppCredentials::isValid)
                .orElse(false);
    }

    private WhatsAppCredentials parseCredentials(IntegrationConfig config) {
        if (config.getCredentials() == null || config.getCredentials().isBlank()) {
            log.warn("WhatsApp credentials JSON is empty");
            return new WhatsAppCredentials(null, null, null);
        }

        try {
            return objectMapper.readValue(config.getCredentials(), WhatsAppCredentials.class);
        } catch (JsonProcessingException e) {
            log.error("Error parsing WhatsApp credentials JSON: {}", e.getMessage());
            return new WhatsAppCredentials(null, null, null);
        }
    }
}
