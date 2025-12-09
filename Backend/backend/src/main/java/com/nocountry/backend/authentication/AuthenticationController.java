package com.nocountry.backend.authentication;

import com.nocountry.backend.dto.CreateOnBoardingDTO;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.mappers.AccountMapper;
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
    private final AccountMapper accountMapper;

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
        if (userDetails == null) {
            // Si no hay usuario autenticado, retornar 401 Unauthorized
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) userDetails;
        return ResponseEntity.ok(AuthenticationResponse.builder()
                .token("valid-session")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .account(user.getAccount() != null ? accountMapper.toDTO(user.getAccount()) : null)
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Eliminar cookie
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
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
