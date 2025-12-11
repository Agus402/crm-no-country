package com.nocountry.backend.configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CRM Startup API")
                        .version("1.0.0")
                        .description("API REST para la gestión de Contactos, Tareas e Integración con WhatsApp y Correo electrónico."));
    }
}