// Cypress support file for e2e tests
// You can add custom commands or global configuration here.

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
    }
  }
}

// Helper para hacer login real si es necesario
Cypress.Commands.add('login', (email = 'admin@test.com', password = 'admin123') => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:8080/api/auth/login',
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    // Si el login es exitoso, las cookies se guardan automáticamente
    if (response.status === 200) {
      cy.log('Login exitoso');
    }
  });
});

export {};

