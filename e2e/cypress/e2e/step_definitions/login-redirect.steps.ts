import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('I login as admin via the form', () => {
  // Seed a known admin user to avoid dependency on env vars
  cy.seedUser({
    email: 'admin-test@test.com',
    password: 'pass1234',
    name: 'Admin Test',
    role: 'admin',
  });
  cy.get('#email, [name="email"]').first().clear().type('admin-test@test.com');
  cy.get('#password, [name="password"]').first().clear().type('pass1234');
  cy.get('button[type="submit"]').click();
});

When('I click the register link', () => {
  cy.get('a[href*="/register"]').click();
});

Then('I should be redirected to {string}', (path: string) => {
  cy.url({ timeout: 10000 }).should('include', path);
});

Then(
  'I should be on the login page with redirect {string}',
  (redirect: string) => {
    cy.url({ timeout: 10000 }).should('include', '/login');
    cy.url().should('include', `redirect=${redirect}`);
  },
);

Then(
  'I should be on the register page with redirect {string}',
  (redirect: string) => {
    cy.url({ timeout: 10000 }).should('include', '/register');
    cy.url().should('satisfy', (url: string) => {
      return (
        url.includes(`redirect=${redirect}`) ||
        url.includes(`redirect=${encodeURIComponent(redirect)}`)
      );
    });
  },
);
