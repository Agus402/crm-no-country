package com.nocountry.backend.configuration;

import com.nocountry.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;


    @Bean
    public UserDetailsService userDetailsService() {
        // Spring Security llama a este método al intentar loguearse.
        // Aquí buscamos al usuario en nuestra BD usando el Repositorio.
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("No se encontró el usuario"));
    }

    //Define el AuthenticationProvider
    @Bean
    public AuthenticationProvider authenticationProvider() {
        // Este es el proveedor estándar para bases de datos relacionales
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();

        // Le dice dónde buscar al usuario (nuestro servicio)
        authenticationProvider.setUserDetailsService(userDetailsService());

        // Le dice cómo verificar la contraseña (nuestro encriptador)
        authenticationProvider.setPasswordEncoder(passwordEncoder());
        return authenticationProvider;
    }

    //Define el AuthenticationManager (Necesario para el endpoint de Login)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    //Define el encriptador de contraseñas (BCrypt)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


}
