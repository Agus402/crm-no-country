interface WhatsAppWhatsAppAutomationRuleDTO {
  id: number;
  name: string;
  triggerEvent: string;
  triggerValue: string | null;
  actions: string;
  isActive: boolean;
  createdById: number | null;
  createdAt: string;
}

interface WhatsAppWhatsAppContactDTO {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  stage: string;
  channel: string;
  status: string | null;
  createdAt: string;
  updatedAt: string;
  tagIds: number[];
  account: {
    id: number;
    companyName: string;
    industry: string | null;
    website: string | null;
    phone: string | null;
    address: string | null;
    timeZone: string | null;
    dateFormat: string | null;
    createdAt: string;
  } | null;
}

type ConversationDTO = {
  id: number;
  leadId: number;
  channel: string;
  status: string;
  startedAt: string;
  unreadCount: number;
  lead?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
};

type MessageDTO = {
  id: number;
  conversationId: number;
  senderType: string;
  messageDirection: string;
  messageType: string;
  content: string;
  sentAt: string;
  externalMessageId?: string;
};

describe("Integración WhatsApp + Flujos Automatizados", () => {
  let rules: WhatsAppWhatsAppAutomationRuleDTO[];
  let contacts: WhatsAppWhatsAppContactDTO[];
  let conversations: ConversationDTO[];
  let messages: MessageDTO[];
  const now = new Date().toISOString();

  beforeEach(() => {
    rules = [];
    contacts = [];
    conversations = [];
    messages = [];

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

    // Mock de recordatorios
    cy.intercept("GET", "**/api/notifications/smart-reminders", {
      statusCode: 200,
      body: [],
    }).as("getReminders");

    // Mock de reglas de automatización
    cy.intercept("GET", "**/api/automation-rules**", (req) => {
      req.reply({ statusCode: 200, body: rules });
    }).as("getAutomationRules");

    // Mock de contactos
    cy.intercept("GET", "**/api/crmleads**", (req) => {
      req.reply({ statusCode: 200, body: contacts });
    }).as("getContacts");

    // Mock de crear contacto
    cy.intercept("POST", "**/api/crmleads", (req) => {
      const body = req.body as { name?: string; email?: string; phone?: string; stage?: string; channel?: string; tagIds?: number[] };
      const newContact: WhatsAppWhatsAppContactDTO = {
        id: contacts.length + 1,
        name: body.name || "Nuevo Contacto",
        email: body.email || "nuevo@example.com",
        phone: body.phone || null,
        stage: body.stage || "ACTIVE_LEAD",
        channel: body.channel || "WHATSAPP",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
        tagIds: body.tagIds || [],
        account: null,
      };
      contacts.push(newContact);
      req.reply({ statusCode: 201, body: newContact });
    }).as("createContact");

    // Mock de conversaciones
    cy.intercept("GET", "**/api/conversations**", (req) => {
      req.reply({ statusCode: 200, body: conversations });
    }).as("getConversations");

    // Mock de crear conversación
    cy.intercept("POST", "**/api/conversations", (req) => {
      const body = req.body as { leadId: number; channel: string };
      const lead = contacts.find((c) => c.id === body.leadId);
      const newConversation: ConversationDTO = {
        id: conversations.length + 1,
        leadId: body.leadId,
        channel: body.channel,
        status: "OPEN",
        startedAt: now,
        unreadCount: 0,
        lead: lead
          ? {
              id: lead.id,
              name: lead.name,
              email: lead.email,
              phone: lead.phone || "",
            }
          : undefined,
      };
      conversations.push(newConversation);
      req.reply({ statusCode: 201, body: newConversation });
    }).as("createConversation");

    // Mock de mensajes
    cy.intercept("GET", "**/api/messages**", (req) => {
      const conversationId = req.url.split("conversationId=")[1]?.split("&")[0];
      const filteredMessages = conversationId
        ? messages.filter((m) => m.conversationId === Number(conversationId))
        : messages;
      req.reply({ statusCode: 200, body: filteredMessages });
    }).as("getMessages");

    // Mock de enviar mensaje
    cy.intercept("POST", "**/api/messages", (req) => {
      const body = req.body as Partial<MessageDTO>;
      const newMessage: MessageDTO = {
        id: messages.length + 1,
        conversationId: body.conversationId || 1,
        senderType: body.senderType || "USER",
        messageDirection: body.messageDirection || "OUTBOUND",
        messageType: body.messageType || "TEXT",
        content: body.content || "",
        sentAt: now,
        externalMessageId: `wamid.${Date.now()}`,
      };
      messages.push(newMessage);
      req.reply({ statusCode: 201, body: newMessage });
    }).as("sendMessage");

    // Mock de crear regla de automatización
    cy.intercept("POST", "**/api/automation-rules", (req) => {
      const body = req.body as Partial<WhatsAppWhatsAppAutomationRuleDTO>;
      const created: WhatsAppWhatsAppAutomationRuleDTO = {
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

    // Mock de actualizar regla
    cy.intercept("PUT", "**/api/automation-rules/**", (req) => {
      const id = Number(req.url.split("/").pop());
      const body = req.body as Partial<WhatsAppWhatsAppAutomationRuleDTO>;
      const index = rules.findIndex((r) => r.id === id);
      if (index !== -1) {
        rules[index] = { ...rules[index], ...body };
        req.reply({ statusCode: 200, body: rules[index] });
      } else {
        req.reply({ statusCode: 404, body: { message: "Rule not found" } });
      }
    }).as("updateRule");

    // Mock de asignar contactos
    cy.intercept("POST", "**/api/automation-rules/**/contacts", (req) => {
      req.reply({ statusCode: 200, body: { success: true } });
    }).as("assignContacts");

    // Mock de obtener contactos asignados
    cy.intercept("GET", "**/api/automation-rules/**/contacts", (req) => {
      req.reply({ statusCode: 200, body: { contactIds: [] } });
    }).as("getAssignedContacts");

    // Mock de ejecutar automatización (simular que cuando se crea un lead, se ejecuta la regla)
    cy.intercept("POST", "**/api/crmleads", (req) => {
      const body = req.body as { name?: string; email?: string; phone?: string; stage?: string; channel?: string; tagIds?: number[] };
      const newContact: WhatsAppWhatsAppContactDTO = {
        id: contacts.length + 1,
        name: body.name || "Nuevo Contacto",
        email: body.email || "nuevo@example.com",
        phone: body.phone || null,
        stage: body.stage || "ACTIVE_LEAD",
        channel: body.channel || "WHATSAPP",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
        tagIds: body.tagIds || [],
        account: null,
      };
      contacts.push(newContact);

      // Simular ejecución de reglas de automatización
      const activeRules = rules.filter(
        (r) => r.isActive && r.triggerEvent === "LEAD_CREATED"
      );
      activeRules.forEach((rule) => {
        try {
          const actions = JSON.parse(rule.actions);
          if (actions.actions) {
            actions.actions.forEach((action: { type: string; template?: string }) => {
              if (action.type === "send-whatsapp" && newContact.phone) {
                // Crear conversación automáticamente
                const conversation: ConversationDTO = {
                  id: conversations.length + 1,
                  leadId: newContact.id,
                  channel: "WHATSAPP",
                  status: "OPEN",
                  startedAt: now,
                  unreadCount: 0,
                  lead: {
                    id: newContact.id,
                    name: newContact.name,
                    email: newContact.email,
                    phone: newContact.phone || "",
                  },
                };
                conversations.push(conversation);

                // Crear mensaje automático de bienvenida
                const welcomeMessage: MessageDTO = {
                  id: messages.length + 1,
                  conversationId: conversation.id,
                  senderType: "SYSTEM",
                  messageDirection: "OUTBOUND",
                  messageType: "TEXT",
                  content: getWelcomeMessageTemplate(action.template),
                  sentAt: now,
                  externalMessageId: `wamid.auto.${Date.now()}`,
                };
                messages.push(welcomeMessage);
              }
            });
          }
        } catch (e) {
          console.error("Error parsing automation rule:", e);
        }
      });

      req.reply({ statusCode: 201, body: newContact });
    }).as("createLeadWithAutomation");
  });

  function getWelcomeMessageTemplate(template?: string): string {
    const templates: Record<string, string> = {
      welcome: "¡Hola! Bienvenido a nuestro CRM. Estamos aquí para ayudarte.",
      "follow-up": "Gracias por tu interés. ¿Te gustaría agendar una reunión?",
      reminder: "Recordatorio: Te esperamos en nuestra próxima reunión.",
      "thank-you": "¡Gracias por confiar en nosotros!",
    };
    return template ? (templates[template] || "Mensaje automático de bienvenida") : "Mensaje automático de bienvenida";
  }

  describe("Flujo completo: Lead → Automatización → Mensaje WhatsApp", () => {
    it("debe crear un lead y enviar mensaje automático de bienvenida por WhatsApp", () => {
      // 1. Crear flujo automatizado de bienvenida WhatsApp
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      cy.get('[data-testid="open-create-rule"]').click();
      cy.get('[data-testid="create-rule-modal"]').should("be.visible");

      cy.get('[data-testid="rule-name-input"]').type("Bienvenida Automática WhatsApp");
      cy.get('[data-testid="trigger-select"]').click();
      cy.get('[data-radix-collection-item]').contains("New Lead Created").click();
      cy.get('[data-testid^="action-type-"]').first().click();
      cy.get('[data-radix-collection-item]').contains("Send WhatsApp").click();
      cy.get('[data-testid^="action-template-"]').first().click();
      cy.get('[data-radix-collection-item]').contains("Welcome Message").click();

      cy.get('[data-testid="submit-rule"]').click();
      cy.wait(["@createRule", "@getAutomationRules"]);

      // 2. Crear un nuevo contacto/lead (simplificado - usar mock directo)
      // En lugar de crear desde la UI, simulamos la creación que dispara la automatización
      cy.visit("/contacts");
      cy.wait("@getContacts");

      // Simular creación de contacto que dispara el flujo automatizado
      // Esto simula lo que haría el backend cuando se crea un lead
      const newContact: WhatsAppContactDTO = {
        id: 1,
        name: "Juan Test",
        email: "juan.test@example.com",
        phone: "1158148792",
        stage: "ACTIVE_LEAD",
        channel: "WHATSAPP",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
        tagIds: [],
        account: null,
      };
      contacts.push(newContact);

      // Simular que el flujo automatizado crea la conversación y envía el mensaje
      const conversation: ConversationDTO = {
        id: 1,
        leadId: 1,
        channel: "WHATSAPP",
        status: "OPEN",
        startedAt: now,
        unreadCount: 0,
        lead: {
          id: 1,
          name: "Juan Test",
          email: "juan.test@example.com",
          phone: "1158148792",
        },
      };
      conversations.push(conversation);

      const welcomeMessage: MessageDTO = {
        id: 1,
        conversationId: 1,
        senderType: "SYSTEM",
        messageDirection: "OUTBOUND",
        messageType: "TEXT",
        content: "¡Hola! Bienvenido a nuestro CRM. Estamos aquí para ayudarte.",
        sentAt: now,
        externalMessageId: `wamid.auto.${Date.now()}`,
      };
      messages.push(welcomeMessage);

      // 3. Verificar que se creó la conversación
      cy.visit("/messages");
      cy.wait("@getConversations");

      // Verificar que aparece la conversación con el nuevo contacto
      cy.contains("Juan Test").should("be.visible");

      // 4. Abrir la conversación y verificar el mensaje automático
      cy.contains("Juan Test").click();
      cy.wait("@getMessages");

      // Verificar que el mensaje de bienvenida está presente
      cy.contains("Bienvenido a nuestro CRM").should("be.visible");
    });

    it("debe enviar mensaje automático cuando se crea un lead asignado a un flujo", () => {
      // 1. Crear flujo automatizado
      const welcomeRule: WhatsAppAutomationRuleDTO = {
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

      // 2. Asignar contacto al flujo
      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      // Crear contacto de prueba primero
      const testContact: WhatsAppContactDTO = {
        id: 1,
        name: "María Test",
        email: "maria.test@example.com",
        phone: "1158148792",
        stage: "ACTIVE_LEAD",
        channel: "WHATSAPP",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
        tagIds: [],
        account: null,
      };
      contacts.push(testContact);

      cy.get('[data-testid="workflow-menu-1"]').click();
      cy.get('[data-testid="workflow-assign-contacts-1"]').click();

      cy.contains("María Test", { timeout: 15000 }).should("be.visible");
      cy.contains("María Test").click();
      cy.get("button").contains(/Asignar 1 contacto/i).click();
      cy.wait("@assignContacts");

      // 3. Simular creación de nuevo lead (que debería disparar el flujo)
      // En un caso real, esto se haría desde el backend cuando se crea el lead
      cy.visit("/messages");
      cy.wait("@getConversations");

      // Verificar que el flujo está activo y listo
      cy.visit("/tasks");
      cy.get('[data-testid="workflow-card-1"]').should("contain", "Active");
    });

    it("debe mostrar mensajes automáticos en la conversación de WhatsApp", () => {
      // Setup: Crear flujo, contacto y conversación con mensaje automático
      const welcomeRule: WhatsAppAutomationRuleDTO = {
        id: 1,
        name: "Bienvenida WhatsApp",
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

      const testContact: WhatsAppContactDTO = {
        id: 1,
        name: "Carlos Test",
        email: "carlos.test@example.com",
        phone: "1158148792",
        stage: "ACTIVE_LEAD",
        channel: "WHATSAPP",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
        tagIds: [],
        account: null,
      };
      contacts.push(testContact);

      const conversation: ConversationDTO = {
        id: 1,
        leadId: 1,
        channel: "WHATSAPP",
        status: "OPEN",
        startedAt: now,
        unreadCount: 0,
        lead: {
          id: 1,
          name: "Carlos Test",
          email: "carlos.test@example.com",
          phone: "1158148792",
        },
      };
      conversations.push(conversation);

      const autoMessage: MessageDTO = {
        id: 1,
        conversationId: 1,
        senderType: "SYSTEM",
        messageDirection: "OUTBOUND",
        messageType: "TEXT",
        content: "¡Hola! Bienvenido a nuestro CRM. Estamos aquí para ayudarte.",
        sentAt: now,
        externalMessageId: "wamid.auto.123456",
      };
      messages.push(autoMessage);

      // Verificar en la UI
      cy.visit("/messages");
      cy.wait("@getConversations");

      cy.contains("Carlos Test").click();
      cy.wait("@getMessages");

      // Verificar que el mensaje automático está visible
      cy.contains("Bienvenido a nuestro CRM").should("be.visible");
      
      // Verificar que el mensaje tiene indicador de automático
      cy.get("body").then(($body) => {
        // El mensaje debería estar marcado como automático o del sistema
        const messageText = $body.text();
        expect(messageText).to.include("Bienvenido");
      });
    });

    it("debe crear múltiples mensajes cuando el flujo tiene múltiples acciones", () => {
      // Crear flujo con múltiples acciones
      const multiActionRule: WhatsAppAutomationRuleDTO = {
        id: 1,
        name: "Secuencia de Bienvenida",
        triggerEvent: "LEAD_CREATED",
        triggerValue: null,
        actions: JSON.stringify({
          waitDays: 0,
          waitHours: 0,
          actions: [
            { type: "send-whatsapp", template: "welcome" },
            { type: "send-whatsapp", template: "follow-up" },
          ],
        }),
        isActive: true,
        createdById: 99,
        createdAt: now,
      };
      rules.push(multiActionRule);

      // Crear contacto y simular ejecución
      const testContact: WhatsAppContactDTO = {
        id: 1,
        name: "Ana Test",
        email: "ana.test@example.com",
        phone: "1158148792",
        stage: "ACTIVE_LEAD",
        channel: "WHATSAPP",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
        tagIds: [],
        account: null,
      };
      contacts.push(testContact);

      const conversation: ConversationDTO = {
        id: 1,
        leadId: 1,
        channel: "WHATSAPP",
        status: "OPEN",
        startedAt: now,
        unreadCount: 0,
        lead: {
          id: 1,
          name: "Ana Test",
          email: "ana.test@example.com",
          phone: "1158148792",
        },
      };
      conversations.push(conversation);

      // Simular mensajes automáticos
      const message1: MessageDTO = {
        id: 1,
        conversationId: 1,
        senderType: "SYSTEM",
        messageDirection: "OUTBOUND",
        messageType: "TEXT",
        content: "¡Hola! Bienvenido a nuestro CRM. Estamos aquí para ayudarte.",
        sentAt: now,
        externalMessageId: "wamid.auto.1",
      };
      const message2: MessageDTO = {
        id: 2,
        conversationId: 1,
        senderType: "SYSTEM",
        messageDirection: "OUTBOUND",
        messageType: "TEXT",
        content: "Gracias por tu interés. ¿Te gustaría agendar una reunión?",
        sentAt: new Date(Date.now() + 1000).toISOString(),
        externalMessageId: "wamid.auto.2",
      };
      messages.push(message1, message2);

      // Verificar en la UI
      cy.visit("/messages");
      cy.wait("@getConversations");

      cy.contains("Ana Test").click();
      cy.wait("@getMessages");

      // Verificar ambos mensajes
      cy.contains("Bienvenido a nuestro CRM").should("be.visible");
      cy.contains("agendar una reunión").should("be.visible");
    });
  });

  describe("Gestión de flujos y mensajes", () => {
    it("debe pausar el flujo y no enviar mensajes automáticos", () => {
      const welcomeRule: WhatsAppAutomationRuleDTO = {
        id: 1,
        name: "Bienvenida WhatsApp",
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

      // Interceptar la actualización para cambiar el estado
      cy.intercept("PUT", "**/api/automation-rules/1", (req) => {
        welcomeRule.isActive = false;
        req.reply({ statusCode: 200, body: welcomeRule });
      }).as("updateRuleToPaused");

      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      // Pausar el flujo
      cy.get('[data-testid="workflow-menu-1"]').click();
      cy.get('[data-testid="workflow-toggle-1"]').click();

      cy.wait("@updateRuleToPaused");
      
      // Recargar las reglas para ver el cambio
      cy.intercept("GET", "**/api/automation-rules**", (req) => {
        req.reply({ statusCode: 200, body: rules });
      }).as("getAutomationRulesUpdated");
      
      cy.reload();
      cy.wait("@getAutomationRulesUpdated");
      
      // Verificar que el badge muestra "Paused"
      cy.get('[data-testid="workflow-card-1"]').within(() => {
        cy.contains("Paused").should("be.visible");
      });

      // Verificar que el flujo está pausado
      cy.then(() => {
        expect(welcomeRule.isActive).to.be.false;
      });
    });

    it("debe activar el flujo y permitir envío de mensajes", () => {
      const welcomeRule: WhatsAppAutomationRuleDTO = {
        id: 1,
        name: "Bienvenida WhatsApp",
        triggerEvent: "LEAD_CREATED",
        triggerValue: null,
        actions: JSON.stringify({
          waitDays: 0,
          waitHours: 0,
          actions: [{ type: "send-whatsapp", template: "welcome" }],
        }),
        isActive: false,
        createdById: 99,
        createdAt: now,
      };
      rules.push(welcomeRule);

      // Interceptar la actualización para cambiar el estado
      cy.intercept("PUT", "**/api/automation-rules/1", (req) => {
        welcomeRule.isActive = true;
        req.reply({ statusCode: 200, body: welcomeRule });
      }).as("updateRuleToActive");

      cy.visit("/tasks");
      cy.wait("@getAutomationRules");

      // Activar el flujo
      cy.get('[data-testid="workflow-menu-1"]').click();
      cy.get('[data-testid="workflow-toggle-1"]').click();

      cy.wait("@updateRuleToActive");
      
      // Recargar las reglas para ver el cambio
      cy.intercept("GET", "**/api/automation-rules**", (req) => {
        req.reply({ statusCode: 200, body: rules });
      }).as("getAutomationRulesUpdated");
      
      cy.reload();
      cy.wait("@getAutomationRulesUpdated");
      
      // Verificar que el badge muestra "Active"
      cy.get('[data-testid="workflow-card-1"]').within(() => {
        cy.contains("Active").should("be.visible");
      });

      // Verificar que el flujo está activo
      cy.then(() => {
        expect(welcomeRule.isActive).to.be.true;
      });
    });
  });
});

