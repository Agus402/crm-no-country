package com.nocountry.backend.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String jwt = null;
        String userEmail = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        } else {
            // Buscar en cookies
            if (request.getCookies() != null) {
                for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                    if ("jwt".equals(cookie.getName())) {
                        jwt = cookie.getValue();
                        break;
                    }
                }
            }
        }

        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Si hay un JWT, intentamos validarlo
        try {
            // Extrae el username del token (sin validar aún)
            userEmail = jwtService.extractUsername(jwt);

            // Si hay username en el token y el contexto de seguridad NO está ya lleno
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Carga el usuario de la DB (necesario para validar expiración/actividad)
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                // Valida que el token sea auténtico (firma y expiración)
                if (jwtService.isTokenValid(jwt, userDetails)) {

                    // Crea el token de autenticación de Spring Security
                    UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null, // Credenciales nulas porque el token ya autenticó
                            userDetails.getAuthorities());

                    authenticationToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    // Establece el usuario en el contexto de seguridad (Usuario autenticado!)
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
            }
        } catch (Exception e) {
            // Si hay algún error al procesar el token (token inválido, usuario no encontrado, etc.)
            // Simplemente continuamos sin autenticar - esto permite que los endpoints públicos funcionen
            // y que Spring Security maneje la autorización
            // No logueamos el error para evitar ruido en los logs cuando hay tokens inválidos en cookies
        }

        // Siempre continuar con la cadena de filtros
        filterChain.doFilter(request, response);
    }

}
