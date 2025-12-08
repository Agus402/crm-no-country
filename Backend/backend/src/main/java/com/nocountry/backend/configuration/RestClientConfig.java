// RestClientConfig.java (Crear en el paquete com.nocountry.backend.configuration)

package com.nocountry.backend.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${WHATSAPP_API_BASE_URL}") // Usar el nombre de la variable de entorno
    private String whatsappApiBaseUrl;

    /**
     * Bean que proporciona un RestClient.Builder para ser usado en WhatsAppApiService.
     */
    @Bean
    public RestClient.Builder restClientBuilder() {
        if (whatsappApiBaseUrl == null || !whatsappApiBaseUrl.startsWith("https://")) {
            // Esto es solo para loggear, pero Spring intentará inyectar el valor NULL
            throw new IllegalArgumentException(
                    "La variable WHATSAPP_API_BASE_URL no está definida o no comienza con https://"
            );
        }

        return RestClient.builder();
    }
}