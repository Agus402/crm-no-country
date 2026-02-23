package com.nocountry.backend.utils;

import com.nocountry.backend.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utilidad para acceder al usuario autenticado desde el contexto de Spring
 * Security.
 */
public class SecurityUtils {

    /**
     * Obtiene el usuario actualmente autenticado.
     * 
     * @return El usuario autenticado
     * @throws RuntimeException si no hay usuario autenticado o el principal no es
     *                          un User
     */
    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No hay usuario autenticado");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }

        throw new RuntimeException("El principal no es una instancia de User");
    }

    /**
     * Obtiene el ID del usuario actualmente autenticado.
     * 
     * @return El ID del usuario autenticado
     * @throws RuntimeException si no hay usuario autenticado
     */
    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
