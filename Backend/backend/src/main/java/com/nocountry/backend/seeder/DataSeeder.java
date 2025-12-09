package com.nocountry.backend.seeder;

import com.nocountry.backend.enums.TaskType;
import com.nocountry.backend.enums.Priority;
import com.nocountry.backend.entity.Account;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.entity.Task;
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

import java.time.LocalDate;
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
            System.out.println("Datos iniciales ya cargados. Omitiendo Seeder.");
            return;
        }

        System.out.println("Cargando datos iniciales de prueba...");


        Account account = Account.builder().companyName(ACCOUNT_NAME)
                .industry("Software").createdAt(LocalDateTime.now()).build();
        account = accountRepository.save(account);

        User adminUser = User.builder().name("Admin").email(USER_EMAIL)
                .password(passwordEncoder.encode("123456")).role(Role.ADMIN).active(true)
                .createdAt(LocalDateTime.now()).account(account).build();
        adminUser = userRepository.save(adminUser);

        account.setOwner(adminUser);
        accountRepository.save(account);

        System.out.println("   -> Creando 20 Leads...");

        createLead("Peppa Pig", "peppa.p@mail.com", "+549111111", Stage.CLIENT, Channel.EMAIL, account);
        createLead("Agustín Scklink", "agustin.s@mail.com", "541122667629", Stage.FOLLOW_UP, Channel.WHATSAPP, account);
        createLead("Jessica Park", "jess.p@mail.com", "+549113333", Stage.ACTIVE_LEAD, Channel.EMAIL, account);
        createLead("Thomas Anderson", "thomas.a@mail.com", "+549114444", Stage.FOLLOW_UP, Channel.WHATSAPP, account);
        createLead("David Liu", "david.l@mail.com", "+549115555", Stage.LOST, Channel.EMAIL, account);
        createLead("Sara Connor", "sara.connor@mail.com", "+549116666", Stage.CLIENT, Channel.WHATSAPP, account);
        createLead("John Smith", "john.smith@mail.com", "+549117777", Stage.ACTIVE_LEAD, Channel.EMAIL, account);
        createLead("Laura Miler", "laura.miler@mail.com", "+549118888", Stage.FOLLOW_UP, Channel.WHATSAPP, account);
        createLead("Robert Green", "robert.g@mail.com", "+549119999", Stage.CLIENT, Channel.EMAIL, account);
        createLead("Maria Garcia", "maria.g@mail.com", "+549110000", Stage.LOST, Channel.WHATSAPP, account);
        createLead("Paul Allen", "paul.allen@mail.com", "+549221111", Stage.CLIENT, Channel.EMAIL, account);
        createLead("Alice Johnson", "alice.j@mail.com", "+549222222", Stage.FOLLOW_UP, Channel.WHATSAPP, account);
        createLead("Mike Ross", "mike.ross@mail.com", "+549223333", Stage.ACTIVE_LEAD, Channel.WHATSAPP, account);
        createLead("Chloe King", "chloe.k@mail.com", "+549224444", Stage.LOST, Channel.EMAIL, account);
        createLead("Elias Vance", "elias.v@mail.com", "+549225555", Stage.CLIENT, Channel.WHATSAPP, account);
        createLead("Fiona Chen", "fiona.c@mail.com", "+549226666", Stage.CLIENT, Channel.WHATSAPP, account);
        createLead("Henry Lee", "henry.l@mail.com", "+549227777", Stage.FOLLOW_UP, Channel.EMAIL, account);
        createLead("Victoria Soto", "victoria.s@mail.com", "+549228888", Stage.ACTIVE_LEAD, Channel.WHATSAPP, account);
        createLead("Ethan Hunt", "ethan.h@mail.com", "+549229999", Stage.LOST, Channel.WHATSAPP, account);
        createLead("Olivia Baker", "olivia.b@mail.com", "+549220000", Stage.CLIENT, Channel.EMAIL, account);

        Long ADMIN_ID = adminUser.getId();

        seedTasks(ADMIN_ID);

        System.out.println("Carga de datos de prueba (20 Leads y 10 Tasks) finalizada.");
    }

    private void seedTasks(Long ADMIN_ID) {
        System.out.println("   -> Creando 10 Tasks...");

        createTask("Llamada de Bienvenida y Calificación",
                "Llamada inicial para comprender las necesidades y el presupuesto del lead.",
                TaskType.MESSAGE,
                "2025-12-09",
                Priority.HIGH,
                6L,
                ADMIN_ID);

        createTask("Enviar Contrato Final y Solicitud de Pago",
                "Enviar documentación legal y pasos para la facturación.",
                TaskType.EMAIL,
                "2025-12-10",
                Priority.HIGH,
                9L,
                ADMIN_ID);

        createTask("Reenviar Propuesta detallada por Email",
                "Enviar versión actualizada de la propuesta tras la última reunión.",
                TaskType.EMAIL,
                "2025-12-11",
                Priority.MEDIUM,
                17L,
                ADMIN_ID);

        createTask("Reunión de Avance - Presentar Demo del Producto",
                "Demostración en vivo de las funcionalidades clave (Comunicación)",
                TaskType.MESSAGE,
                "2025-12-12",
                Priority.HIGH,
                3L,
                ADMIN_ID);

        createTask("Llamada para Entender Razón de Pérdida (Feedback)",
                "Llamada rápida para obtener feedback y mantener la relación.",
                TaskType.MESSAGE,
                "2025-12-15",
                Priority.LOW,
                5L,
                ADMIN_ID);

        createTask("Chequeo Post-Venta (Soporte y Satisfacción)",
                "Verificar que el cliente esté satisfecho con la implementación.",
                TaskType.MESSAGE,
                "2026-01-05",
                Priority.MEDIUM,
                1L,
                ADMIN_ID);

        createTask("Investigar Perfil de Cliente Potencial",
                "Búsqueda de información sobre la empresa y el rol del lead.",
                TaskType.MESSAGE,
                "2025-12-09",
                Priority.LOW,
                11L,
                ADMIN_ID);

        createTask("Coordinar Cita para café de negocios",
                "Establecer la fecha y hora para la reunión informal (Comunicación).",
                TaskType.MESSAGE,
                "2025-12-16",
                Priority.MEDIUM,
                13L,
                ADMIN_ID);

        createTask("Enviar Catálogo de Productos por WhatsApp",
                "Enviar PDF o enlace directo al catálogo por WhatsApp.",
                TaskType.MESSAGE,
                "2025-12-11",
                Priority.MEDIUM,
                4L,
                ADMIN_ID);

        createTask("Preparar Oferta de Renovación de Servicio",
                "Generar el documento con la nueva tarifa y beneficios.",
                TaskType.EMAIL,
                "2026-02-01",
                Priority.HIGH,
                20L,
                ADMIN_ID);

        System.out.println("   -> Creadas 10 Tasks exitosamente.");
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

    private void createTask(String title, String description, TaskType taskType,
                            String dueDateString, Priority priority,
                            Long leadId, Long assignedToId) {

        LocalDate localDueDate = LocalDate.parse(dueDateString);

        CrmLead crmLead = crmLeadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("CrmLead no encontrado con ID: " + leadId));

        User assignedUser = userRepository.findById(assignedToId)
                .orElseThrow(() -> new RuntimeException("User asignado no encontrado con ID: " + assignedToId));

        Task task = Task.builder()
                .title(title)
                .description(description)
                .taskType(taskType)
                .dueDate(localDueDate.atStartOfDay())
                .priority(priority)
                .crmLead(crmLead)
                .assignedTo(assignedUser)
                .isCompleted(false)
                .isAutomated(false)
                .createdAt(LocalDateTime.now())
                .build();

        taskRepository.save(task);
    }
}