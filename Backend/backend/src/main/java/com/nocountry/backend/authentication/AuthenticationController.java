package com.nocountry.backend.authentication;

import com.nocountry.backend.dto.CreateOnBoardingDTO;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    // Inyectamos el servicio que contiene la lógica de registro, login y JWT
    private final AuthenticationService authenticationService;

    @Value("${app.cookie.secure}")
    private boolean secureCookie;

    // Endpoint para el registro de nuevos usuarios. Recibe los datos, llama al
    // servicio para crear el usuario y genera un JWT
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request,
            HttpServletResponse response) {
        AuthenticationResponse authResponse = authenticationService.register(request);
        setJwtCookie(response, authResponse.getToken());
        return ResponseEntity.ok(authResponse);
    }

    // Endpoint para el login de usuarios. Valida credenciales, autentica al usuario
    // y genera un JWT si son válidas.
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request,
            HttpServletResponse response) {
        AuthenticationResponse authResponse = authenticationService.login(request);
        setJwtCookie(response, authResponse.getToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/onboarding")
    public ResponseEntity<AuthenticationResponse> registerAccount(@RequestBody CreateOnBoardingDTO request,
            HttpServletResponse response) {
        AuthenticationResponse authResponse = authenticationService.registerAccount(request);
        setJwtCookie(response, authResponse.getToken());
        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthenticationResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        // Si llega aquí, el filtro ya validó el token (cookie o header) y puso el
        // usuario en el contexto
        // Podemos devolver un token nuevo (refresh implícito) o simplemente info del
        // usuario
        // Por ahora devolvemos una estructura simple, el frontend usará esto para saber
        // que está logueado
        return ResponseEntity.ok(AuthenticationResponse.builder()
                .token("valid-session") // No necesitamos devolver el token real si ya está en la cookie
                .build());
    }

    private void setJwtCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie); // Configurable por ambiente
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 días
        response.addCookie(cookie);
    }
}
