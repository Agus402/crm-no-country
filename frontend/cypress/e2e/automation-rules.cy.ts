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

describe("Automation rules", () => {
  let rules: AutomationRuleDTO[];
  const now = new Date().toISOString();

  beforeEach(() => {
    rules = [
      {
        id: 1,
        name: "Demo welcome",
        triggerEvent: "DEMO_COMPLETED",
        triggerValue: null,
        actions: JSON.stringify({ actions: [] }),
        isActive: true,
        createdById: 1,
        createdAt: now,
      },
    ];

    cy.intercept("GET", "**/api/auth/me", {
      statusCode: 200,
      body: {
        id: 99,
        name: "Agent",
        email: "agent@example.com",
        role: "USER",
        active: true,
        account: null,
        createdAt: now,
      },
    }).as("getAuth");

    cy.intercept("GET", "**/api/tasks**", {
      statusCode: 200,
      body: [],
    }).as("getTasks");

    cy.intercept("GET", "**/api/notifications/smart-reminders", {
      statusCode: 200,
      body: [],
    }).as("getReminders");

    cy.intercept("GET", "**/api/automation-rules**", (req) => {
      req.reply({ statusCode: 200, body: rules });
    }).as("getAutomationRules");

    cy.intercept("POST", "**/api/automation-rules", (req) => {
      const body = req.body as Partial<AutomationRuleDTO>;
      const created: AutomationRuleDTO = {
        id: 2,
        name: body.name || "Nueva regla",
        triggerEvent: body.triggerEvent || "LEAD_CREATED",
        triggerValue: null,
        actions: body.actions || JSON.stringify({ actions: [] }),
        isActive: true,
        createdById: 99,
        createdAt: now,
      };
      rules = [...rules, created];
      req.reply({ statusCode: 201, body: created });
    }).as("createRule");

    cy.intercept("DELETE", "**/api/automation-rules/**", (req) => {
      const id = Number(req.url.split("/").pop());
      rules = rules.filter((r) => r.id !== id);
      req.reply({ statusCode: 204, body: "" });
    }).as("deleteRule");
  });

  it("crea una nueva regla y la muestra en la lista", () => {
    cy.visit("/tasks");
    cy.wait("@getAutomationRules");

    cy.contains("h2", "Flujos automatizados").scrollIntoView().should("exist");
    cy.get('[data-testid="workflow-card-1"]').scrollIntoView().should("be.visible");

    cy.get('[data-testid="open-create-rule"]').scrollIntoView().click();
    cy.get('[data-testid="create-rule-modal"]').should("be.visible");

    cy.get('[data-testid="rule-name-input"]').type("Regla de follow-up");
    cy.get('[data-testid="trigger-select"]').click({ force: true });
    cy.get('[data-radix-select-viewport]').should("be.visible");
    cy.get('[data-radix-collection-item]').contains("Demo Completed").click({ force: true });
    cy.get('[data-testid="trigger-select"]').should("contain.text", "Demo Completed");

    cy.get('[data-testid^="action-type-"]').first().click({ force: true });
    cy.get('[data-radix-collection-item]').contains("Create Task").click({ force: true });
    cy.get('[data-testid^="action-type-"]').first().should("contain.text", "Create Task");

    cy.get('[data-testid="submit-rule"]').click({ force: true });

    cy.wait(["@createRule", "@getAutomationRules"]);
    cy.get('[data-testid="workflow-card-2"]').should("be.visible");
    cy.contains("Regla de follow-up").should("be.visible");
  });

  it("permite eliminar una regla existente", () => {
    cy.visit("/tasks");
    cy.wait("@getAutomationRules");

    cy.get('[data-testid="workflow-card-1"]').scrollIntoView().should("exist");
    cy.get('[data-testid="workflow-menu-1"]').scrollIntoView().click({ force: true });
    cy.get('[data-testid="workflow-delete-1"]').click();

    cy.wait("@deleteRule");
    cy.get('[data-testid="workflow-card-1"]').should("not.exist");
  });
});

