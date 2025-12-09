package com.nocountry.backend.services;

import com.nocountry.backend.dto.CreateUpdateUserDTO;
import com.nocountry.backend.dto.UserDTO;
import com.nocountry.backend.entity.Account;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.mappers.UserMapper;
import com.nocountry.backend.repository.AccountRepository;
import com.nocountry.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {


    private final UserRepository userRepository;
    private final AccountRepository accountRepository; // Para buscar la Cuenta
    private final UserMapper userMapper; // Para conversión entre Entity <-> DTO
    private final PasswordEncoder passwordEncoder;

    // --- LECTURA ---

    public List<UserDTO> findAllUsers() {
        // Llama al mapper para convertir la lista de Entidades a lista de DTOs.
        List<User> users = userRepository.findAll();
        return userMapper.toDTOList(users);
    }

    public UserDTO findUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        return userMapper.toDTO(user);
    }

    // --- CREACIÓN ---

    @Transactional
    public UserDTO createUser(CreateUpdateUserDTO userDTO) {

        // 1. Validación de unicidad de email
        if (userRepository.findByEmail(userDTO.email()).isPresent()) {
            throw new RuntimeException("El email ya está registrado.");
        }

        // 2. Obtener la Cuenta (Account) para la FK
        Account account = accountRepository.findById(userDTO.accountId())
                .orElseThrow(() -> new RuntimeException("Cuenta (Account) no encontrada."));

        // 3. Construir la entidad User
        User newUser = User.builder()
                .name(userDTO.name())
                .email(userDTO.email())
                // Encriptamos la contraseña con BCrypt
                .password(passwordEncoder.encode(userDTO.password()))
                .role(userDTO.role())
                .active(true) // Activo por defecto
                .createdAt(LocalDateTime.now())
                .account(account) // Asignamos la FK de la Cuenta
                .build();

        User savedUser = userRepository.save(newUser);
        return userMapper.toDTO(savedUser);
    }

    // --- ACTUALIZACIÓN ---

    @Transactional
    public UserDTO updateUser(Long id, CreateUpdateUserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        // 1. Actualizar campos básicos
        user.setName(userDTO.name());
        user.setEmail(userDTO.email());
        user.setRole(userDTO.role());

        // 2. Actualizar contraseña (solo si se proporciona y no está vacía)
        if (userDTO.password() != null && !userDTO.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(userDTO.password()));
        }

        // 3. Actualizar Cuenta (Manejo seguro de Nulos)
        Long newAccountId = userDTO.accountId();

        // Obtenemos el ID de la cuenta actual de forma segura (puede ser null)
        Long currentAccountId = (user.getAccount() != null) ? user.getAccount().getId() : null;

        // Si el ID nuevo es diferente al actual (y no es null), actualizamos
        if (newAccountId != null && !newAccountId.equals(currentAccountId)) {
            Account newAccount = accountRepository.findById(newAccountId)
                    .orElseThrow(() -> new RuntimeException("Nueva Cuenta no encontrada con ID: " + newAccountId));
            user.setAccount(newAccount);
        } else if (newAccountId == null) {
            // Si se envía null, desvinculamos la cuenta (opcional, según su regla de negocio)
            user.setAccount(null);
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toDTO(updatedUser);
    }

    // --- GESTIÓN DE ESTADO ---

    @Transactional
    public UserDTO toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        // Invierte el estado: activo -> inactivo, inactivo -> activo
        user.setActive(!user.isActive());

        User updatedUser = userRepository.save(user);
        return userMapper.toDTO(updatedUser);
    }

    // --- ELIMINACIÓN ---

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado con ID: " + id);
        }
        // NOTA: La eliminación en cascada de tareas y preferencias
        // se maneja a través de las anotaciones JPA en la entidad User.
        userRepository.deleteById(id);
    }

}
