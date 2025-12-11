package com.nocountry.backend.configuration;

import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/**
 * Configuración manual de JavaMailSender.
 * Se crea el bean solo si spring.mail.username y spring.mail.password están configurados y no están vacíos.
 * Esto permite que la aplicación arranque sin credenciales de email.
 */
@Configuration
public class MailConfig {

    @Bean
    @ConditionalOnExpression(
        "!'${spring.mail.username:}'.isEmpty() && !'${spring.mail.password:}'.isEmpty()"
    )
    public JavaMailSender javaMailSender(
            @org.springframework.beans.factory.annotation.Value("${spring.mail.host:smtp.gmail.com}") String host,
            @org.springframework.beans.factory.annotation.Value("${spring.mail.port:587}") Integer port,
            @org.springframework.beans.factory.annotation.Value("${spring.mail.username}") String username,
            @org.springframework.beans.factory.annotation.Value("${spring.mail.password}") String password) {

        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.debug", "false");

        return mailSender;
    }
}

