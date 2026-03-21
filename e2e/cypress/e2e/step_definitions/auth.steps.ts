import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('the database is clean', () => {
  cy.resetDb();
});

Given('I am on the registration page', () => {
  cy.visit('/register');
});

Given('I am on the login page', () => {
  cy.visit('/login');
});

Given('I am on the home page', () => {
  cy.visit('/');
});

Given(
  'a user exists with email {string} and password {string}',
  (email: string, password: string) => {
    cy.seedUser({ email, password, name: 'Test User' });
  },
);

Given(
  'I am logged in as {string} with password {string}',
  (email: string, password: string) => {
    cy.login(email, password);
  },
);

When('I fill in {string} with {string}', (field: string, value: string) => {
  cy.get(`#${field}, [name="${field}"]`).first().clear().type(value);
});

When('I click the submit button', () => {
  cy.get('button[type="submit"]').click();
});

When('I click the logout button', () => {
  cy.contains('button', /sign out|logout/i).click();
});

Then('I should be redirected to the home page', () => {
  cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/');
});

Then('I should be redirected to the login page', () => {
  cy.url().should('include', '/login');
});

Then('I should see {string} in the navigation', (name: string) => {
  cy.get('nav').should('contain.text', name);
});

Then('I should see an error alert', () => {
  cy.get('[role="alert"], [class*="error"], [class*="red"]').should(
    'be.visible',
  );
});

Then('I should see the sign in link', () => {
  cy.get('nav')
    .contains(/sign in/i)
    .should('be.visible');
});
