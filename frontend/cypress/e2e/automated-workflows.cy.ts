type AutomationRuleDTO = {
  id: number;
  name: string;
  triggerEvent: string;
  triggerValue: string | null;
  actions: string;
  isActive: boolean;
  createdById: number | null;
  createdAt: string;
};

type ContactDTO = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  stage?: string;
};

describe("Flujos Automatizados - Tests Completos", () => {
  let rules: AutomationRuleDTO[];
  let contacts: ContactDTO[];
  const now = new Date().toISOString();

  beforeEach(() => {
    // Datos iniciales
    rules = [
      {
        id: 1,
        name: "Bienvenida a nuevos leads",
        triggerEvent: "LEAD_CREATED",
        triggerValue: null,
        actions: JSON.stringify({
          waitDays: 0,
          waitHours: 0,
          actions: [{ type: "send-email", template: "welcome" }],
        }),
        isActive: true,
        createdById: 99,
        createdAt: now,
      },
      {
        id: 2,
        name: "Follow-up después de demo",
        triggerEvent: "DEMO_COMPLETED",
        triggerValue: null,
        actions: JSON.stringify({
          waitDays: 2,
          waitHours: 0,
          actions: [
            { type: "send-email", template: "follow-up" },
            { type: "create-task" },
          ],
        }),
        isActive: false,
        createdById: 99,
        createdAt: now,
      },
    ];

    contacts = [
      {
        id: 1,
        name: "Juan Pérez",
        email: "juan.perez@example.com",
        phone: "+1234567890",
        stage: "Lead",
      },
      {
        id: 2,
        name: "María García",
        email: "maria.garcia@example.com",
        phone: "+0987654321",
        stage: "Prospect",
      },
      {
        id: 3,
        name: "Carlos López",
        email: "carlos.lopez@example.com",
        stage: "Customer",
      },
    ];

    // Mock de autenticación
    cy.intercept("GET", "**/api/auth/me", {
      statusCode: 200,
      body: {
        id: 99,
        name: "Test User",
        email: "test@example.com",
        role: "USER",
        active: true,
        account: null,
        createdAt: now,
      },
    }).as("getAuth");

    // Mock de tareas
    cy.intercept("GET", "**/api/tasks**", {
      statusCode: 200,
      body: [],
    }).as("getTasks");

    // Mock de recordatorios inteligentes
    cy.intercept("GET", "**/api/notifications/smart-reminders", {
      statusCode: 200,
      body: [],
    }).as("getReminders");

    // Mock de reglas de automatización
    cy.intercept("GET", "**/api/automation-rules**", (req) => {
      req.reply({ statusCode: 200, body: rules });
    }).as("getAutomationRules");

    // Mock de contactos
    cy.intercept("GET", "**/api/contacts**", (req) => {
      req.reply({ statusCode: 200, body: contacts });
    }).as("getContacts");

    // Mock de creación de regla
    cy.intercept("POST", "**/api/automation-rules", (req) => {
      const body = req.body as Partial<AutomationRuleDTO>;
      const created: AutomationRuleDTO = {
        id: rules.length + 1,
        name: body.name || "Nueva regla",
        triggerEvent: body.triggerEvent || "LEAD_CREATED",
        triggerValue: body.triggerValue || null,
        actions: body.actions || JSON.stringify({ actions: [] }),
        isActive: body.isActive !== undefined ? body.isActive : true,
        createdById: 99,
        createdAt: now,
      };
      rules.push(created);
      req.reply({ statusCode: 201, body: created });
    }).as("createRule");

    // Mock de actualización de regla
    cy.intercept("PUT", "**/api/automation-rules/**", (req) => {
      const id = Number(req.url.split("/").pop());
      const body = req.body as Partial<AutomationRuleDTO>;
      const index = rules.findIndex((r) => r.id === id);
      if (index !== -1) {
        rules[index] = { ...rules[index], ...body };
        req.reply({ statusCode: 200, body: rules[index] });
      } else {
        req.reply({ statusCode: 404, body: { message: "Rule not found" } });
      }
    }).as("updateRule");

    // Mock de eliminación de regla
    cy.intercept("DELETE", "**/api/automation-rules/**", (req) => {
      const id = Number(req.url.split("/").pop());
      rules = rules.filter((r) => r.id !== id);
      req.reply({ statusCode: 204, body: "" });
    }).as("deleteRule");

    // Mock de asignación de contactos
    cy.intercept("POST", "**/api/automation-rules/**/contacts", (req) => {
      req.reply({ statusCode: 200, body: { success: true } });
    }).as("assignContacts");

    // Mock de obtener contactos asignados
    cy.intercept("GET", "**/api/automation-rules/**/contacts", (req) => {
      const id = Number(req.url.split("/")[req.url.split("/").length - 2]);
      // Simular que algunos contactos están asignados
      const assignedIds = id === 1 ? [1, 2] : [];
      req.reply({ statusCode: 200, body: { contactIds: assignedIds } });
    }).as("getAssignedContacts");
  });

  describe("Visualización de flujos automatizados", () => {
    it("debe mostrar la lista de flujos automatizados existentes", () => {
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      cy.contains("h2", "Flujos automatizados").should("be.visible");
      cy.get('[data-testid="workflow-card-1"]').should("be.visible");
      cy.get('[data-testid="workflow-card-2"]').should("be.visible");

      // Verificar que se muestran los nombres de las reglas
      cy.contains("Bienvenida a nuevos leads").should("be.visible");
      cy.contains("Follow-up después de demo").should("be.visible");

      // Verificar estados
      cy.get('[data-testid="workflow-card-1"]').should("contain", "Active");
      cy.get('[data-testid="workflow-card-2"]').should("contain", "Paused");
    });

    it("debe mostrar el contador de contactos asignados", () => {
      cy.visit("/tasks");
      cy.wait(["@getAutomationRules", "@getAssignedContacts"]);

      cy.get('[data-testid="workflow-card-1"]').within(() => {
        cy.contains(/contacto/i).should("be.visible");
      });
    });
  });

  describe("Creación de flujos automatizados", () => {
    it("debe crear un flujo básico con un trigger y una acción", () => {
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      // Abrir modal de creación
      cy.get('[data-testid="open-create-rule"]').click();
      cy.get('[data-testid="create-rule-modal"]').should("be.visible");

      // Llenar nombre de la regla
      cy.get('[data-testid="rule-name-input"]').type("Bienvenida automática");

      // Seleccionar trigger
      cy.get('[data-testid="trigger-select"]').click();
      cy.get('[data-radix-collection-item]').contains("New Lead Created").click();
      cy.get('[data-testid="trigger-select"]').should("contain.text", "New Lead Created");

      // Seleccionar acción
      cy.get('[data-testid^="action-type-"]').first().click();
      cy.get('[data-radix-collection-item]').contains("Send Email").click();
      cy.get('[data-testid^="action-type-"]').first().should("contain.text", "Send Email");

      // Seleccionar template
      cy.get('[data-testid^="action-template-"]').first().click();
      cy.get('[data-radix-collection-item]').contains("Welcome Message").click();

      // Crear regla
      cy.get('[data-testid="submit-rule"]').click();

      // Verificar que se creó
      cy.wait(["@createRule", "@getAutomationRules"]);
      cy.contains("Bienvenida automática").should("be.visible");
    });

    it("debe crear un flujo con tiempo de espera configurado", () => {
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      cy.get('[data-testid="open-create-rule"]').click();
      cy.get('[data-testid="create-rule-modal"]').should("be.visible");

      cy.get('[data-testid="rule-name-input"]').type("Follow-up con delay");

      // Configurar trigger
      cy.get('[data-testid="trigger-select"]').click();
      cy.get('[data-radix-collection-item]').contains("Demo Completed").click();

      // Configurar tiempo de espera
      cy.get('[data-testid="wait-days-input"]').clear().type("3");
      cy.get('[data-testid="wait-hours-input"]').clear().type("6");

      // Configurar acción
      cy.get('[data-testid^="action-type-"]').first().click();
      cy.get('[data-radix-collection-item]').contains("Send WhatsApp").click();

      // Verificar que el resumen muestra el tiempo de espera
      cy.contains("wait").should("be.visible");
      cy.contains("3 days").should("be.visible");
      cy.contains("6 hours").should("be.visible");

      cy.get('[data-testid="submit-rule"]').click();

      cy.wait(["@createRule", "@getAutomationRules"]);
      cy.contains("Follow-up con delay").should("be.visible");
    });

    it("debe crear un flujo con múltiples acciones", () => {
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      cy.get('[data-testid="open-create-rule"]').click();
      cy.get('[data-testid="create-rule-modal"]').should("be.visible");

      cy.get('[data-testid="rule-name-input"]').type("Secuencia completa de onboarding");

      // Configurar trigger
      cy.get('[data-testid="trigger-select"]').click();
      cy.get('[data-radix-collection-item]').contains("New Lead Created").click();

      // Primera acción
      cy.get('[data-testid^="action-type-"]').first().click();
      cy.get('[data-radix-collection-item]').contains("Send Email").click();
      cy.get('[data-testid^="action-template-"]').first().click();
      cy.get('[data-radix-collection-item]').contains("Welcome Message").click();

      // Agregar segunda acción
      cy.get('[data-testid="add-action"]').click();

      // Segunda acción
      cy.get('[data-testid^="action-type-"]').last().click();
      cy.get('[data-radix-collection-item]').contains("Create Task").click();

      // Agregar tercera acción
      cy.get('[data-testid="add-action"]').click();

      // Tercera acción
      cy.get('[data-testid^="action-type-"]').last().click();
      cy.get('[data-radix-collection-item]').contains("Move to Segment").click();

      // Verificar que el resumen muestra 3 acciones
      cy.contains("3 actions").should("be.visible");

      cy.get('[data-testid="submit-rule"]').click();

      cy.wait(["@createRule", "@getAutomationRules"]);
      cy.contains("Secuencia completa de onboarding").should("be.visible");
    });

    it("debe validar que se seleccione un trigger antes de crear", () => {
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      cy.get('[data-testid="open-create-rule"]').click();
      cy.get('[data-testid="create-rule-modal"]').should("be.visible");

      cy.get('[data-testid="rule-name-input"]').type("Regla sin trigger");

      // Intentar crear sin trigger (el navegador mostrará alerta)
      cy.get('[data-testid="submit-rule"]').click();

      // El modal debería seguir visible (no se cerró)
      cy.get('[data-testid="create-rule-modal"]').should("be.visible");
    });

    it("debe probar todos los tipos de triggers disponibles", () => {
      const triggers = [
        { value: "New Lead Created", expected: "new-lead" },
        { value: "Demo Completed", expected: "demo-completed" },
        { value: "Invoice Sent", expected: "invoice-sent" },
        { value: "No Response for 7 Days", expected: "no-response" },
        { value: "Contract Signed", expected: "contract-signed" },
        { value: "Payment Received", expected: "payment-received" },
      ];

      triggers.forEach((trigger) => {
        cy.visit("/tasks");
        cy.wait("@getAutomationRules");

        cy.get('[data-testid="open-create-rule"]').click();
        cy.get('[data-testid="create-rule-modal"]').should("be.visible");

        cy.get('[data-testid="rule-name-input"]').type(`Test ${trigger.value}`);

        cy.get('[data-testid="trigger-select"]').click();
        cy.get('[data-radix-collection-item]').contains(trigger.value).click();
        cy.get('[data-testid="trigger-select"]').should("contain.text", trigger.value);

        // Configurar una acción mínima
        cy.get('[data-testid^="action-type-"]').first().click();
        cy.get('[data-radix-collection-item]').contains("Create Task").click();

        cy.get('[data-testid="submit-rule"]').click();
        cy.wait(["@createRule", "@getAutomationRules"]);

        // Cerrar modal si está abierto
        cy.get("body").then(($body) => {
          if ($body.find('[data-testid="create-rule-modal"]').length > 0) {
            cy.get('[data-testid="create-rule-modal"]').within(() => {
              cy.get("button").contains("Cancel").click();
            });
          }
        });
      });
    });

    it("debe probar todos los tipos de acciones disponibles", () => {
      const actions = [
        { value: "Send Email", needsTemplate: true },
        { value: "Send WhatsApp", needsTemplate: true },
        { value: "Create Task", needsTemplate: false },
        { value: "Move to Segment", needsTemplate: false },
        { value: "Send SMS", needsTemplate: true },
      ];

      actions.forEach((action) => {
        cy.visit("/tasks");
        cy.wait("@getAutomationRules");

        cy.get('[data-testid="open-create-rule"]').click();
        cy.get('[data-testid="create-rule-modal"]').should("be.visible");

        cy.get('[data-testid="rule-name-input"]').type(`Test ${action.value}`);

        // Configurar trigger
        cy.get('[data-testid="trigger-select"]').click();
        cy.get('[data-radix-collection-item]').contains("New Lead Created").click();

        // Configurar acción
        cy.get('[data-testid^="action-type-"]').first().click();
        cy.get('[data-radix-collection-item]').contains(action.value).click();

        // Si necesita template, seleccionar uno
        if (action.needsTemplate) {
          cy.get('[data-testid^="action-template-"]').first().click();
          cy.get('[data-radix-collection-item]').contains("Welcome Message").click();
        }

        cy.get('[data-testid="submit-rule"]').click();
        cy.wait(["@createRule", "@getAutomationRules"]);

        // Cerrar modal si está abierto
        cy.get("body").then(($body) => {
          if ($body.find('[data-testid="create-rule-modal"]').length > 0) {
            cy.get('[data-testid="create-rule-modal"]').within(() => {
              cy.get("button").contains("Cancel").click();
            });
          }
        });
      });
    });
  });

  describe("Gestión de flujos automatizados", () => {
    it("debe activar un flujo pausado", () => {
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      // Verificar que el flujo 2 está pausado
      cy.get('[data-testid="workflow-card-2"]').should("contain", "Paused");

      // Abrir menú y activar
      cy.get('[data-testid="workflow-menu-2"]').click();
      cy.get('[data-testid="workflow-toggle-2"]').click();

      cy.wait("@updateRule");
      cy.get('[data-testid="workflow-card-2"]').should("contain", "Active");
    });

    it("debe pausar un flujo activo", () => {
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      // Verificar que el flujo 1 está activo
      cy.get('[data-testid="workflow-card-1"]').should("contain", "Active");

      // Abrir menú y pausar
      cy.get('[data-testid="workflow-menu-1"]').click();
      cy.get('[data-testid="workflow-toggle-1"]').click();

      cy.wait("@updateRule");
      cy.get('[data-testid="workflow-card-1"]').should("contain", "Paused");
    });

    it("debe eliminar un flujo automatizado", () => {
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      const initialCount = rules.length;
      cy.get('[data-testid="workflow-card-1"]').should("exist");

      // Eliminar flujo
      cy.get('[data-testid="workflow-menu-1"]').click();
      cy.get('[data-testid="workflow-delete-1"]').click();

      cy.wait("@deleteRule");
      cy.get('[data-testid="workflow-card-1"]').should("not.exist");
    });
  });

  describe("Asignación de contactos a flujos", () => {
    it("debe abrir el modal de asignación de contactos", () => {
      cy.visit("/tasks");
      cy.wait(["@getAutomationRules", "@getContacts"]);

      cy.get('[data-testid="workflow-menu-1"]').click();
      cy.get('[data-testid="workflow-assign-contacts-1"]').click();

      // Verificar que el modal se abre
      cy.contains("Asignar contactos").should("be.visible");
      cy.contains("Bienvenida a nuevos leads").should("be.visible");
    });

    it("debe buscar y seleccionar contactos", () => {
      cy.visit("/tasks");
      cy.wait(["@getAutomationRules", "@getContacts"]);

      cy.get('[data-testid="workflow-menu-1"]').click();
      cy.get('[data-testid="workflow-assign-contacts-1"]').click();

      // Esperar a que carguen los contactos
      cy.contains("Juan Pérez").should("be.visible");

      // Buscar contacto
      cy.get('input[placeholder*="Buscar contacto"]').type("Juan");
      cy.contains("Juan Pérez").should("be.visible");
      cy.contains("María García").should("not.exist");

      // Seleccionar contacto
      cy.contains("Juan Pérez").click();

      // Verificar que se seleccionó
      cy.contains("1 contacto seleccionado").should("be.visible");
    });

    it("debe asignar múltiples contactos a un flujo", () => {
      cy.visit("/tasks");
      cy.wait(["@getAutomationRules", "@getContacts"]);

      cy.get('[data-testid="workflow-menu-1"]').click();
      cy.get('[data-testid="workflow-assign-contacts-1"]').click();

      // Esperar a que carguen los contactos
      cy.contains("Juan Pérez").should("be.visible");

      // Seleccionar múltiples contactos
      cy.contains("Juan Pérez").click();
      cy.contains("María García").click();
      cy.contains("Carlos López").click();

      // Verificar contador
      cy.contains("3 contactos seleccionados").should("be.visible");

      // Asignar
      cy.get("button").contains(/Asignar 3 contactos/i).click();

      cy.wait("@assignContacts");
      cy.contains("Asignar contactos").should("not.exist");
    });

    it("debe cancelar la asignación de contactos", () => {
      cy.visit("/tasks");
      cy.wait(["@getAutomationRules", "@getContacts"]);

      cy.get('[data-testid="workflow-menu-1"]').click();
      cy.get('[data-testid="workflow-assign-contacts-1"]').click();

      cy.contains("Juan Pérez").should("be.visible");
      cy.contains("Juan Pérez").click();

      // Cancelar
      cy.get("button").contains("Cancelar").click();

      // Verificar que el modal se cerró
      cy.contains("Asignar contactos").should("not.exist");
    });
  });

  describe("Flujos completos de usuario", () => {
    it("debe completar un flujo completo: crear, asignar contactos, activar y eliminar", () => {
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      // 1. Crear un nuevo flujo
      cy.get('[data-testid="open-create-rule"]').click();
      cy.get('[data-testid="create-rule-modal"]').should("be.visible");

      cy.get('[data-testid="rule-name-input"]').type("Flujo completo de prueba");
      cy.get('[data-testid="trigger-select"]').click();
      cy.get('[data-radix-collection-item]').contains("New Lead Created").click();
      cy.get('[data-testid^="action-type-"]').first().click();
      cy.get('[data-radix-collection-item]').contains("Send Email").click();
      cy.get('[data-testid^="action-template-"]').first().click();
      cy.get('[data-radix-collection-item]').contains("Welcome Message").click();

      cy.get('[data-testid="submit-rule"]').click();
      cy.wait(["@createRule", "@getAutomationRules"]);

      // 2. Verificar que se creó
      cy.contains("Flujo completo de prueba").should("be.visible");
      const newWorkflowId = rules.length.toString();

      // 3. Asignar contactos
      cy.get(`[data-testid="workflow-menu-${newWorkflowId}"]`).click();
      cy.get(`[data-testid="workflow-assign-contacts-${newWorkflowId}"]`).click();

      cy.contains("Juan Pérez").should("be.visible");
      cy.contains("Juan Pérez").click();
      cy.contains("María García").click();

      cy.get("button").contains(/Asignar 2 contactos/i).click();
      cy.wait("@assignContacts");

      // 4. Pausar el flujo
      cy.get(`[data-testid="workflow-menu-${newWorkflowId}"]`).click();
      cy.get(`[data-testid="workflow-toggle-${newWorkflowId}"]`).click();
      cy.wait("@updateRule");
      cy.get(`[data-testid="workflow-card-${newWorkflowId}"]`).should("contain", "Paused");

      // 5. Activar el flujo nuevamente
      cy.get(`[data-testid="workflow-menu-${newWorkflowId}"]`).click();
      cy.get(`[data-testid="workflow-toggle-${newWorkflowId}"]`).click();
      cy.wait("@updateRule");
      cy.get(`[data-testid="workflow-card-${newWorkflowId}"]`).should("contain", "Active");

      // 6. Eliminar el flujo
      cy.get(`[data-testid="workflow-menu-${newWorkflowId}"]`).click();
      cy.get(`[data-testid="workflow-delete-${newWorkflowId}"]`).click();
      cy.wait("@deleteRule");
      cy.contains("Flujo completo de prueba").should("not.exist");
    });

    it("debe crear un flujo complejo con múltiples pasos y tiempos de espera", () => {
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      cy.get('[data-testid="open-create-rule"]').click();
      cy.get('[data-testid="create-rule-modal"]').should("be.visible");

      cy.get('[data-testid="rule-name-input"]').type("Secuencia avanzada de nurturing");

      // Configurar trigger
      cy.get('[data-testid="trigger-select"]').click();
      cy.get('[data-radix-collection-item]').contains("Demo Completed").click();

      // Configurar tiempo de espera inicial
      cy.get('[data-testid="wait-days-input"]').clear().type("1");
      cy.get('[data-testid="wait-hours-input"]').clear().type("12");

      // Primera acción: Email de agradecimiento
      cy.get('[data-testid^="action-type-"]').first().click();
      cy.get('[data-radix-collection-item]').contains("Send Email").click();
      cy.get('[data-testid^="action-template-"]').first().click();
      cy.get('[data-radix-collection-item]').contains("Thank You Message").click();

      // Segunda acción: Crear tarea de follow-up
      cy.get('[data-testid="add-action"]').click();
      cy.get('[data-testid^="action-type-"]').last().click();
      cy.get('[data-radix-collection-item]').contains("Create Task").click();

      // Tercera acción: WhatsApp
      cy.get('[data-testid="add-action"]').click();
      cy.get('[data-testid^="action-type-"]').last().click();
      cy.get('[data-radix-collection-item]').contains("Send WhatsApp").click();
      cy.get('[data-testid^="action-template-"]').last().click();
      cy.get('[data-radix-collection-item]').contains("Follow-up Message").click();

      // Verificar resumen
      cy.contains("Secuencia avanzada de nurturing").should("be.visible");
      cy.contains("1 day").should("be.visible");
      cy.contains("12 hours").should("be.visible");
      cy.contains("3 actions").should("be.visible");

      // Crear
      cy.get('[data-testid="submit-rule"]').click();
      cy.wait(["@createRule", "@getAutomationRules"]);

      cy.contains("Secuencia avanzada de nurturing").should("be.visible");
    });
  });
});

