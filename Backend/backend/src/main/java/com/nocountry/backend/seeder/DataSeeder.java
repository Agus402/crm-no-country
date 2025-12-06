package com.nocountry.backend.seeder;

// ... (Todas las importaciones existentes) ...

import com.nocountry.backend.entity.Account;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.entity.User;
import com.nocountry.backend.enums.Channel;
import com.nocountry.backend.enums.Role;
import com.nocountry.backend.enums.Stage;
import com.nocountry.backend.repository.AccountRepository;
import com.nocountry.backend.repository.CrmLeadRepository;
import com.nocountry.backend.repository.TaskRepository;
import com.nocountry.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CrmLeadRepository crmLeadRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String USER_EMAIL = "admin@test.com";
    private static final String ACCOUNT_NAME = "Tech Solutions S.R.L.";

    @Override
    public void run(String... args) throws Exception {
        seedInitialData();
    }

    private void seedInitialData() {
        if (userRepository.findByEmail(USER_EMAIL).isPresent()) {
            System.out.println("✅ Datos iniciales ya cargados. Omitiendo Seeder.");
            return;
        }

        System.out.println("⚙️ Cargando datos iniciales de prueba...");

        // ======================================
        // 1. CREAR ACCOUNT & USER BASE (ADMIN)
        // ======================================
        // (Asumo que esta lógica se ejecuta y genera 'account' y 'adminUser')

        Account account = Account.builder().companyName(ACCOUNT_NAME)
                .industry("Software").createdAt(LocalDateTime.now()).build();
        account = accountRepository.save(account);

        User adminUser = User.builder().name("Admin").email(USER_EMAIL)
                .password(passwordEncoder.encode("123456")).role(Role.ADMIN).active(true)
                .createdAt(LocalDateTime.now()).account(account).build();
        adminUser = userRepository.save(adminUser);

        account.setOwner(adminUser);
        accountRepository.save(account);

        System.out.println("   -> Creando 5 Leads...");

        createLead("Peppa Pig", "peppa.p@mail.com", "+549111111", Stage.CLIENT, Channel.EMAIL, account);
        createLead("Marcus Brown", "marcus.b@mail.com", "+549112222", Stage.FOLLOW_UP, Channel.WHATSAPP, account);
        createLead("Jessica Park", "jess.p@mail.com", "+549113333", Stage.ACTIVE_LEAD, Channel.EMAIL, account);
        createLead("Thomas Anderson", "thomas.a@mail.com", "+549114444", Stage.FOLLOW_UP, Channel.WHATSAPP, account);
        createLead("David Liu", "david.l@mail.com", "+549115555", Stage.LOST, Channel.EMAIL, account);


        // ======================================
        // 3. CREAR TASKS (Tareas de ejemplo)
        // (Opcional: Si quieres asociar estas tareas a los leads creados,
        //  puedes modificar esta sección para buscar el Lead por email o ID).
        // ======================================
        // Omitiendo la creación de tareas por simplicidad, pero se mantiene el método para referencia.

        System.out.println("🎉 Carga de datos de prueba (5 Leads) finalizada.");
    }

    private void createLead(String name, String email, String phone, Stage stage, Channel channel, Account account) {
        CrmLead lead = CrmLead.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .stage(stage)
                .channel(channel)
                .status("NEW")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .account(account)
                .owner(account.getOwner())
                .build();
        crmLeadRepository.save(lead);
    }
}