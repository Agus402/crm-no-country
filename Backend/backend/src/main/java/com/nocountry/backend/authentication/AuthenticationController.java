package com.nocountry.backend.authentication;

import com.nocountry.backend.dto.CreateOnBoardingDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    // Endpoint para el registro de nuevos usuarios. Recibe los datos, llama al
    // servicio para crear el usuario y genera un JWT
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authenticationService.register(request));
    }

    // Endpoint para el login de usuarios. Valida credenciales, autentica al usuario
    // y genera un JWT si son válidas.
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(authenticationService.login(request));
    }

    @PostMapping("/onboarding")
    public ResponseEntity<AuthenticationResponse> registerAccount(@RequestBody CreateOnBoardingDTO request) {
        return ResponseEntity.ok(authenticationService.registerAccount(request));
    }

}
