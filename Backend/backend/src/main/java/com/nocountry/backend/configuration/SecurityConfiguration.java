package com.nocountry.backend.configuration;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

        private final AuthenticationProvider authenticationProvider;

        @Value("${cors.allowed-origins}")
        private String allowedOrigins;

        /**
         * Define la cadena de filtros de seguridad para la aplicación.
         * Aquí se configuran las reglas de acceso, el manejo de sesiones STATLESS y
         * se inyecta el filtro JWT.
         * * @param http Objeto para configurar la seguridad HTTP.
         *
         * @return SecurityFilterChain configurado.
         */
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http,
                        JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {

                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(Customizer.withDefaults())
                                .authorizeHttpRequests(auth -> auth
                                                // Permite acceso libre a las rutas de autenticación
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers(
                                                                "/api/webhooks/whatsapp",
                                                                "/api/media/**",
                                                                "/ws/**",
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/v3/api-docs/**",
                                                                "/v3/api-docs",
                                                                "/swagger-resources/**",
                                                                "/webjars/**")
                                                .permitAll()
                                                // .requestMatchers(HttpMethod.POST, "/api/accounts").permitAll()
                                                // .requestMatchers("/algunotro/**").hasRole("USER") solo accede el que
                                                // tiene role USER, por si lo necesito
                                                .anyRequest().authenticated())
                                .sessionManagement(
                                                // Política de sesión sin estado (STATLESS) para usar JWT
                                                session -> session
                                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                // Configura el proveedor de autenticación
                                .authenticationProvider(authenticationProvider)
                                // Añade el filtro JWT ANTES del filtro estándar de login con usuario/contraseña
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();

        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
