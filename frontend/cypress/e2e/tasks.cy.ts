type TaskDTO = {
  id: number;
  title: string;
  description?: string | null;
  dueDate: string;
  createdAt: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  taskType: "MESSAGE" | "EMAIL";
  completed: boolean;
  crmLeadDTO?: {
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
    account: null;
  };
  assignedTo?: {
    id: number;
    name: string;
    email: string;
    role: string;
    active: boolean;
    account: null;
    createdAt: string;
  };
  isAutomated?: boolean;
};

describe("Tasks section", () => {
  let fixtures: TaskDTO[];
  let reminders: { id: string; text: string; time: string }[];
  let automationRules: any[];
  const now = new Date().toISOString();
  const contacts = [
    {
      id: 501,
      name: "Maria Lopez",
      email: "maria@example.com",
      phone: "123456789",
      stage: "Active Lead",
      channel: "Email",
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
      tagIds: [],
      account: null,
    },
    {
      id: 502,
      name: "Juan Perez",
      email: "juan@example.com",
      phone: "555123456",
      stage: "Follow-up",
      channel: "WhatsApp",
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
      tagIds: [],
      account: null,
    },
  ];
  const user = {
    id: 99,
    name: "Agent",
    email: "agent@example.com",
    role: "USER",
    active: true,
    account: null,
    createdAt: now,
  };

  beforeEach(() => {
    fixtures = [
      {
        id: 1,
        title: "Llamar al lead",
        description: "Revisar propuesta",
        dueDate: now,
        createdAt: now,
        priority: "HIGH",
        taskType: "MESSAGE",
        completed: false,
        crmLeadDTO: contacts[0],
        assignedTo: user,
      },
      {
        id: 2,
        title: "Enviar email",
        description: "Demo follow-up",
        dueDate: now,
        createdAt: now,
        priority: "MEDIUM",
        taskType: "EMAIL",
        completed: true,
        crmLeadDTO: contacts[1],
        assignedTo: user,
      },
    ];
    reminders = [];
    automationRules = [];

    // Configurar intercepts ANTES de cualquier visita
    // Usar patrón más amplio para capturar todas las variantes de la URL
    cy.intercept("GET", "**/api/auth/me", {
      statusCode: 200,
      body: user,
    }).as("getAuth");
    
    // También interceptar login por si acaso
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 200,
      body: { message: "Login successful" },
    }).as("login");

    cy.intercept("GET", "**/api/tasks**", (req) => {
      req.reply({ statusCode: 200, body: fixtures });
    }).as("getTasks");

    cy.intercept("PATCH", "**/api/tasks/1/complete", (req) => {
      fixtures = fixtures.map((task) =>
        task.id === 1 ? { ...task, completed: !task.completed } : task
      );
      req.reply({ statusCode: 200, body: fixtures.find((t) => t.id === 1) });
    }).as("toggleTask");

    cy.intercept("GET", "**/api/notifications/smart-reminders", (req) => {
      req.reply({ statusCode: 200, body: reminders });
    }).as("getReminders");

    cy.intercept("GET", "**/api/automation-rules**", (req) => {
      req.reply({ statusCode: 200, body: automationRules });
    }).as("getAutomationRules");

    cy.intercept("GET", "**/api/crmleads**", {
      statusCode: 200,
      body: contacts,
    }).as("getContacts");

    cy.intercept("POST", "**/api/tasks", (req) => {
      const body = req.body as Partial<TaskDTO> & { crmLead_Id?: number; enableReminder?: boolean };
      const contact = contacts.find((c) => c.id === body.crmLead_Id) || contacts[0];
      const newId = fixtures.length + 1;
      const created: TaskDTO = {
        id: newId,
        title: body.title || `Tarea ${newId}`,
        description: body.description ?? null,
        dueDate: body.dueDate || now,
        createdAt: now,
        priority: (body.priority as TaskDTO["priority"]) || "MEDIUM",
        taskType: (body.taskType as TaskDTO["taskType"]) || "MESSAGE",
        completed: false,
        crmLeadDTO: contact,
        assignedTo: user,
        isAutomated: body.isAutomated || false,
      };

      fixtures = [...fixtures, created];

      if (body.enableReminder) {
        reminders = [
          {
            id: "rem-1",
            text: `Recordatorio para ${created.title}`,
            time: "Mañana 9:00 AM",
          },
        ];
      }

      if (body.isAutomated) {
        automationRules = [
          {
            id: 11,
            name: `Regla para ${created.title}`,
            triggerEvent: "LEAD_CREATED",
            triggerValue: null,
            actions: JSON.stringify({ actions: [] }),
            isActive: true,
            createdById: user.id,
            createdAt: now,
          },
        ];
      }

      req.reply({ statusCode: 201, body: created });
    }).as("createTask");
  });

  it("lista tareas y permite completar una", () => {
    // Asegurarse de que los intercepts estén configurados antes de visitar
    cy.visit("/tasks", {
      onBeforeLoad: (win) => {
        // Forzar que los intercepts estén listos
      },
    });

    // Esperar a que la autenticación se complete
    cy.wait("@getAuth", { timeout: 10000 });
    
    cy.contains("h1", "Tareas y Recordatorios").should("be.visible");
    cy.contains("Llamar al lead").should("be.visible");
    cy.contains("Enviar email").should("be.visible");

    cy.get('[data-testid="task-card-1"]').within(() => {
      cy.get('[data-testid="task-checkbox-1"]').click();
      cy.get('[data-testid="task-checkbox-1"]').should("be.checked");
      cy.contains("h3", "Llamar al lead").should("have.class", "line-through");
    });

    cy.wait(["@getAuth", "@getTasks", "@getReminders", "@getAutomationRules"]);
  });

  it("crea una nueva tarea manual", () => {
    const today = new Date().toISOString().split("T")[0];

    cy.visit("/tasks");
    cy.wait("@getAuth", { timeout: 10000 });
    cy.wait(["@getTasks", "@getReminders", "@getAutomationRules"]);

    cy.contains("button", "Crear tarea").click();
    cy.wait("@getContacts");

    cy.get("#title").type("Tarea de seguimiento");
    cy.get("#contact").click({ force: true });
    cy.get('[data-radix-collection-item]').contains("Maria Lopez").click({ force: true });
    cy.get("#dueDate").type(today);
    cy.get("#dueTime").type("09:30");
    cy.get("#description").type("Llamar para confirmar demo");

    cy.contains("button", "Create Task").click({ force: true });
    cy.wait("@createTask");

    cy.contains("h3", "Tarea de seguimiento").should("be.visible");
    cy.get('[data-testid="task-card-3"]').should("be.visible");
  });

  it("crea una tarea con recordatorio y lo muestra en el panel", () => {
    const today = new Date().toISOString().split("T")[0];

    cy.visit("/tasks");
    cy.wait("@getAuth", { timeout: 10000 });
    cy.wait(["@getTasks", "@getReminders", "@getAutomationRules"]);

    cy.contains("button", "Crear tarea").click();
    cy.wait("@getContacts");

    cy.get("#title").type("Tarea con recordatorio");
    cy.get("#contact").click({ force: true });
    cy.get('[data-radix-collection-item]').contains("Juan Perez").click({ force: true });
    cy.get("#dueDate").type(today);
    cy.get("#dueTime").type("11:00");
    cy.get("#reminder").check({ force: true });

    cy.contains("button", "Create Task").click({ force: true });
    cy.wait("@createTask");
    cy.wait("@getReminders");

    cy.contains("Recordatorios inteligentes").should("be.visible");
    cy.contains("Recordatorio para Tarea con recordatorio").should("be.visible");
  });

  it("crea una tarea automatizada y actualiza los flujos", () => {
    const today = new Date().toISOString().split("T")[0];

    cy.visit("/tasks");
    cy.wait("@getAuth", { timeout: 10000 });
    cy.wait(["@getTasks", "@getReminders", "@getAutomationRules"]);

    cy.contains("button", "Crear tarea").click();
    cy.wait("@getContacts");

    cy.get("#title").type("Tarea automatizada");
    cy.get("#contact").click({ force: true });
    cy.get('[data-radix-collection-item]').contains("Maria Lopez").click({ force: true });
    cy.get("#dueDate").type(today);
    cy.get("#dueTime").type("15:30");
    cy.get("#automated").check({ force: true });

    cy.contains("button", "Create Task").click({ force: true });
    cy.wait("@createTask");
    cy.wait("@getAutomationRules");

    cy.get('[data-testid^="workflow-card"]').should("have.length.at.least", 1);
    cy.contains("Regla para Tarea automatizada").should("be.visible");
    cy.contains("h3", "Tarea automatizada").should("be.visible");
    cy.contains('[data-testid^="task-card-"]', "Automatizada").should("be.visible");
  });
});

