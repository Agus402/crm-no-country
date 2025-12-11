/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login a user
     * @example cy.login('user@example.com', 'password123')
     */
    login(email?: string, password?: string): Chainable<void>;
  }
}

