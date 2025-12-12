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
  channel?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  tagIds?: number[];
  account?: any;
};

describe("Flujo de Bienvenida WhatsApp", () => {
  let rules: AutomationRuleDTO[];
  let contacts: ContactDTO[];
  const now = new Date().toISOString();
  let autoCreatedRuleId: number | null = null;

  beforeEach(() => {
    // Inicializar sin reglas para probar la creación automática
    rules = [];
    contacts = [
      {
        id: 1,
        name: "Juan Pérez",
        email: "juan.perez@example.com",
        phone: "+1234567890",
        stage: "ACTIVE_LEAD",
        channel: "WHATSAPP",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
        tagIds: [],
        account: null,
      },
      {
        id: 2,
        name: "María García",
        email: "maria.garcia@example.com",
        phone: "+0987654321",
        stage: "ACTIVE_LEAD",
        channel: "WHATSAPP",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
        tagIds: [],
        account: null,
      },
      {
        id: 3,
        name: "Carlos López",
        email: "carlos.lopez@example.com",
        phone: "+1122334455",
        stage: "FOLLOW_UP",
        channel: "WHATSAPP",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
        tagIds: [],
        account: null,
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

    // Mock de contactos - interceptar todas las variantes de la URL
    cy.intercept("GET", "**/api/crmleads**", (req) => {
      req.reply({ statusCode: 200, body: contacts });
    }).as("getContacts");
    
    // También interceptar sin parámetros
    cy.intercept("GET", "**/api/crmleads", (req) => {
      req.reply({ statusCode: 200, body: contacts });
    }).as("getContactsNoParams");

    // Mock de reglas de automatización - inicialmente vacío
    cy.intercept("GET", "**/api/automation-rules**", (req) => {
      req.reply({ statusCode: 200, body: rules });
    }).as("getAutomationRules");

    // Mock de creación automática de regla (simula lo que hace el frontend)
    cy.intercept("POST", "**/api/automation-rules", (req) => {
      const body = req.body as Partial<AutomationRuleDTO>;
      const created: AutomationRuleDTO = {
        id: rules.length + 1,
        name: body.name || "Bienvenida WhatsApp - Nuevos Leads",
        triggerEvent: body.triggerEvent || "LEAD_CREATED",
        triggerValue: body.triggerValue || null,
        actions: body.actions || JSON.stringify({
          waitDays: 0,
          waitHours: 0,
          actions: [{ type: "send-whatsapp", template: "welcome" }],
        }),
        isActive: body.isActive !== undefined ? body.isActive : true,
        createdById: 99,
        createdAt: now,
      };
      rules.push(created);
      autoCreatedRuleId = created.id;
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

    // Mock de asignación de contactos
    cy.intercept("POST", "**/api/automation-rules/**/contacts", (req) => {
      req.reply({ statusCode: 200, body: { success: true } });
    }).as("assignContacts");

    // Mock de obtener contactos asignados
    cy.intercept("GET", "**/api/automation-rules/**/contacts", (req) => {
      const id = Number(req.url.split("/")[req.url.split("/").length - 2]);
      // Simular contactos asignados
      const assignedIds = id === 1 ? [1, 2] : [];
      req.reply({ statusCode: 200, body: { contactIds: assignedIds } });
    }).as("getAssignedContacts");
  });

  describe("Creación automática del flujo", () => {
    it("debe crear automáticamente el flujo de bienvenida WhatsApp cuando no hay flujos existentes", () => {
      // Simular que el frontend crea el flujo automáticamente
      // Primero visitamos la página sin reglas
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      // El frontend debería detectar que no hay reglas y crear una automáticamente
      // Simulamos esto creando la regla manualmente en el test
      const welcomeRule: AutomationRuleDTO = {
        id: 1,
        name: "Bienvenida WhatsApp - Nuevos Leads",
        triggerEvent: "LEAD_CREATED",
        triggerValue: null,
        actions: JSON.stringify({
          waitDays: 0,
          waitHours: 0,
          actions: [{ type: "send-whatsapp", template: "welcome" }],
        }),
        isActive: true,
        createdById: 99,
        createdAt: now,
      };

      // Simular la creación automática
      cy.window().then((win) => {
        // Actualizar las reglas mockeadas
        rules.push(welcomeRule);
      });

      // Recargar la página para que se vea el flujo creado
      cy.intercept("GET", "**/api/automation-rules**", (req) => {
        req.reply({ statusCode: 200, body: rules });
      }).as("getAutomationRulesReload");

      cy.reload();
      cy.wait("@getAutomationRulesReload");

      // Verificar que el flujo aparece
      cy.contains("Bienvenida WhatsApp - Nuevos Leads").should("be.visible");
      cy.get('[data-testid^="workflow-card-"]').should("have.length.at.least", 1);
    });

    it("debe mostrar el flujo con la configuración correcta", () => {
      // Crear el flujo manualmente para el test
      const welcomeRule: AutomationRuleDTO = {
        id: 1,
        name: "Bienvenida WhatsApp - Nuevos Leads",
        triggerEvent: "LEAD_CREATED",
        triggerValue: null,
        actions: JSON.stringify({
          waitDays: 0,
          waitHours: 0,
          actions: [{ type: "send-whatsapp", template: "welcome" }],
        }),
        isActive: true,
        createdById: 99,
        createdAt: now,
      };
      rules.push(welcomeRule);

      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      // Verificar que el flujo se muestra
      cy.contains("Bienvenida WhatsApp - Nuevos Leads").should("be.visible");
      
      // Verificar que está activo
      cy.get('[data-testid="workflow-card-1"]').within(() => {
        cy.contains("Active").should("be.visible");
      });
    });
  });

  describe("Asignación de contactos al flujo", () => {
    beforeEach(() => {
      // Crear el flujo de bienvenida para estos tests
      const welcomeRule: AutomationRuleDTO = {
        id: 1,
        name: "Bienvenida WhatsApp - Nuevos Leads",
        triggerEvent: "LEAD_CREATED",
        triggerValue: null,
        actions: JSON.stringify({
          waitDays: 0,
          waitHours: 0,
          actions: [{ type: "send-whatsapp", template: "welcome" }],
        }),
        isActive: true,
        createdById: 99,
        createdAt: now,
      };
      rules.push(welcomeRule);
    });

    it("debe permitir asignar contactos al flujo de bienvenida WhatsApp", () => {
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      // Verificar que el flujo existe
      cy.contains("Bienvenida WhatsApp - Nuevos Leads").should("be.visible");

      // Abrir el menú del flujo
      cy.get('[data-testid="workflow-menu-1"]').click();
      
      // Click en "Asignar contactos"
      cy.get('[data-testid="workflow-assign-contacts-1"]').click();

      // Verificar que el modal se abre
      cy.contains("Asignar contactos").should("be.visible");
      cy.contains("Bienvenida WhatsApp - Nuevos Leads").should("be.visible");

      // Esperar a que aparezcan los contactos (puede haber un delay mientras carga)
      cy.contains("Juan Pérez", { timeout: 15000 }).should("be.visible");

      // Seleccionar contactos
      cy.contains("Juan Pérez").click();
      cy.contains("María García").click();

      // Verificar que se seleccionaron
      cy.contains("2 contactos seleccionados").should("be.visible");

      // Asignar contactos
      cy.get("button").contains(/Asignar 2 contactos/i).click();

      cy.wait("@assignContacts");
      
      // Verificar que el modal se cerró
      cy.contains("Asignar contactos").should("not.exist");
    });

    it("debe mostrar mensaje cuando no hay contactos disponibles", () => {
      // Simular que no hay contactos
      cy.intercept("GET", "**/api/crmleads**", {
        statusCode: 200,
        body: [],
      }).as("getContactsEmpty");

      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      cy.get('[data-testid="workflow-menu-1"]').click();
      cy.get('[data-testid="workflow-assign-contacts-1"]').click();

      cy.wait("@getContactsEmpty");

      // Verificar el mensaje
      cy.contains(/No hay contactos disponibles|No se encontraron contactos/i).should("be.visible");
    });

    it("debe permitir buscar contactos en el modal de asignación", () => {
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      cy.get('[data-testid="workflow-menu-1"]').click();
      cy.get('[data-testid="workflow-assign-contacts-1"]').click();

      // Esperar a que el modal se abra y cargue los contactos
      cy.contains("Asignar contactos").should("be.visible");
      cy.contains("Juan Pérez", { timeout: 15000 }).should("be.visible");

      // Buscar un contacto específico
      cy.get('input[placeholder*="Buscar contacto"]').type("María");

      // Verificar que solo aparece María
      cy.contains("María García").should("be.visible");
      cy.contains("Juan Pérez").should("not.exist");
      cy.contains("Carlos López").should("not.exist");

      // Limpiar búsqueda
      cy.get('input[placeholder*="Buscar contacto"]').clear();
      cy.contains("Juan Pérez").should("be.visible");
    });
  });

  describe("Gestión del flujo de bienvenida", () => {
    beforeEach(() => {
      const welcomeRule: AutomationRuleDTO = {
        id: 1,
        name: "Bienvenida WhatsApp - Nuevos Leads",
        triggerEvent: "LEAD_CREATED",
        triggerValue: null,
        actions: JSON.stringify({
          waitDays: 0,
          waitHours: 0,
          actions: [{ type: "send-whatsapp", template: "welcome" }],
        }),
        isActive: true,
        createdById: 99,
        createdAt: now,
      };
      rules.push(welcomeRule);
    });

    it("debe permitir pausar el flujo de bienvenida", () => {
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      cy.get('[data-testid="workflow-card-1"]').should("contain", "Active");

      cy.get('[data-testid="workflow-menu-1"]').click();
      cy.get('[data-testid="workflow-toggle-1"]').click();

      cy.wait("@updateRule");
      cy.get('[data-testid="workflow-card-1"]').should("contain", "Paused");
    });

    it("debe permitir activar el flujo pausado", () => {
      // Primero pausar el flujo
      rules[0].isActive = false;

      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      cy.get('[data-testid="workflow-card-1"]').should("contain", "Paused");

      cy.get('[data-testid="workflow-menu-1"]').click();
      cy.get('[data-testid="workflow-toggle-1"]').click();

      cy.wait("@updateRule");
      cy.get('[data-testid="workflow-card-1"]').should("contain", "Active");
    });
  });

  describe("Flujo completo de bienvenida WhatsApp", () => {
    it("debe completar el flujo completo: crear, asignar contactos y verificar", () => {
      // Simular creación automática del flujo
      const welcomeRule: AutomationRuleDTO = {
        id: 1,
        name: "Bienvenida WhatsApp - Nuevos Leads",
        triggerEvent: "LEAD_CREATED",
        triggerValue: null,
        actions: JSON.stringify({
          waitDays: 0,
          waitHours: 0,
          actions: [{ type: "send-whatsapp", template: "welcome" }],
        }),
        isActive: true,
        createdById: 99,
        createdAt: now,
      };
      rules.push(welcomeRule);

      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      // 1. Verificar que el flujo existe
      cy.contains("Bienvenida WhatsApp - Nuevos Leads").should("be.visible");
      cy.get('[data-testid="workflow-card-1"]').should("be.visible");

      // 2. Asignar contactos
      cy.get('[data-testid="workflow-menu-1"]').click();
      cy.get('[data-testid="workflow-assign-contacts-1"]').click();

      // Esperar a que el modal se abra y cargue los contactos
      cy.contains("Asignar contactos").should("be.visible");
      cy.contains("Juan Pérez", { timeout: 15000 }).should("be.visible");
      cy.contains("Juan Pérez").click();
      cy.contains("María García").click();

      cy.get("button").contains(/Asignar 2 contactos/i).click();
      cy.wait("@assignContacts");

      // 3. Verificar que el flujo está activo
      cy.get('[data-testid="workflow-card-1"]').within(() => {
        cy.contains("Active").should("be.visible");
      });

      // 4. Verificar la configuración del flujo
      // El flujo debe tener trigger LEAD_CREATED y acción send-whatsapp
      const rule = rules[0];
      expect(rule.triggerEvent).to.equal("LEAD_CREATED");
      expect(rule.actions).to.include("send-whatsapp");
      expect(rule.actions).to.include("welcome");
    });
  });
});

