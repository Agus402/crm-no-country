package com.nocountry.backend.configuration;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Define la cadena de filtros de seguridad para la aplicación.
     * Aquí se configuran las reglas de acceso, el manejo de sesiones STATLESS y
     * se inyecta el filtro JWT.
     * * @param http Objeto para configurar la seguridad HTTP.
     * @return SecurityFilterChain configurado.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Permite acceso libre a las rutas de autenticación
                        .requestMatchers("/auth/**").permitAll()
                        //.requestMatchers("/algunotro/**").hasRole("USER") solo accede el que tiene role USER, por si lo necesito
                        .anyRequest().authenticated())
                .sessionManagement(
                        // Política de sesión sin estado (STATLESS) para usar JWT
                        session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Configura el proveedor de autenticación
                .authenticationProvider(authenticationProvider)
                // Añade el filtro JWT ANTES del filtro estándar de login con usuario/contraseña
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();

    }
}
