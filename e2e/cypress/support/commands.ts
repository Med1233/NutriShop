const API = 'http://localhost:4000';

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${API}/api/auth/login`,
    body: { email, password },
  }).then((res) => {
    // Cookies are automatically stored by cy.request
    expect(res.status).to.eq(200);
  });
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.login('macinessa365@gmail.com', '123456');
});

Cypress.Commands.add('seedUser', (data: { email: string; password: string; name: string; role?: string }) => {
  cy.task('db:seed-user', data);
});

Cypress.Commands.add('resetDb', () => {
  cy.task('db:reset');
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
      seedUser(data: { email: string; password: string; name: string; role?: string }): Chainable<void>;
      resetDb(): Chainable<void>;
    }
  }
}
