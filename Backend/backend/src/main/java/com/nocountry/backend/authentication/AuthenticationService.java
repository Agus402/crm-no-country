package com.nocountry.backend.authentication;

import com.nocountry.backend.configuration.JwtService;
import com.nocountry.backend.dto.CreateOnBoardingDTO;
import com.nocountry.backend.entity.Account;
import com.nocountry.backend.enums.Role;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.repository.AccountRepository;
import com.nocountry.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor

public class AuthenticationService {

        private final UserRepository userRepository;

        private final AccountRepository accountRepository;

        private final PasswordEncoder passwordEncoder;

        private final JwtService jwtService;

        private final AuthenticationManager authenticationManager;

        /**
         * Procesa el registro de un nuevo usuario.
         * 1. Hashea la contraseña.
         * 2. Guarda el usuario en la base de datos.
         * 3. Genera el token JWT.
         */
        public AuthenticationResponse register(RegisterRequest request) {
                var user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(Role.USER)
                                .active(true)
                                .build();
                ;

                userRepository.save(user);

                var jwt = jwtService.generateToken(user);

                return AuthenticationResponse.builder()
                                .token(jwt)
                                .name(user.getName())
                                .email(user.getEmail())
                                .build();
        }

        /**
         * Procesa el inicio de sesión.
         * 1. Valida las credenciales usando AuthenticationManager.
         * 2. Genera el token JWT si la validación es exitosa.
         */
        public AuthenticationResponse login(AuthenticationRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword())

                );

                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow();

                var jwt = jwtService.generateToken(user);

                return AuthenticationResponse.builder()
                                .token(jwt)
                                .name(user.getName())
                                .email(user.getEmail())
                                .build();
        }

        /**
         * ONBOARDING: Registra una nueva empresa y su usuario administrador inicial.
         * Este método reemplaza el flujo manual de crear cuenta -> crear usuario.
         */
        @Transactional // Importante: Si falla el usuario, se hace rollback de la cuenta
        public AuthenticationResponse registerAccount(CreateOnBoardingDTO request) {

                // 1. Validar si el usuario o la empresa ya existen (Opcional pero recomendado)
                if (userRepository.findByEmail(request.userEmail()).isPresent()) {
                        throw new RuntimeException("User email is already registered.");
                }
                if (accountRepository.findByCompanyName(request.companyName()).isPresent()) {
                        throw new RuntimeException("Company name is already registered.");
                }

                // 2. Crear y Guardar la Cuenta (Empresa)
                Account newAccount = Account.builder()
                                .companyName(request.companyName())
                                .industry(request.industry())
                                .website(request.website())
                                .phone(request.phone())
                                .address(request.address())
                                .createdAt(LocalDateTime.now())
                                // .isActive(true) // Si decides volver a usar este campo
                                .build();

                Account savedAccount = accountRepository.save(newAccount);

                // 3. Crear y Guardar el Usuario Admin vinculado a la Cuenta
                User newUser = User.builder()
                                .name(request.userName())
                                .email(request.userEmail())
                                .password(passwordEncoder.encode(request.password()))
                                .role(Role.ADMIN) // El creador es siempre ADMIN
                                .active(true)
                                .createdAt(LocalDateTime.now())
                                .account(savedAccount) // Vinculación Clave
                                .build();

                User savedUser = userRepository.save(newUser);

                // 4. Asignar al usuario como 'owner' de la cuenta y actualizar (Cierra el
                // círculo)
                savedAccount.setOwner(savedUser);
                accountRepository.save(savedAccount);

                // 5. Generar Token JWT para el nuevo usuario
                var jwt = jwtService.generateToken(savedUser);

                return AuthenticationResponse.builder()
                                .token(jwt)
                                .name(savedUser.getName())
                                .email(savedUser.getEmail())
                                .build();
        }
}
