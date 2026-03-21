import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I am logged in as the default admin', () => {
  cy.seedUser({
    email: 'admin@test.com',
    password: 'admin1234',
    name: 'Test Admin',
    role: 'admin',
  });
  cy.login('admin@test.com', 'admin1234');
});

When('I navigate to the admin page', () => {
  cy.visit('/admin');
});

When('I click on the {string} tab', (tabName: string) => {
  cy.contains('button', new RegExp(tabName, 'i')).click();
});

When(
  'I create a user with name {string} email {string} password {string} role {string}',
  (name: string, email: string, password: string, role: string) => {
    cy.contains('button', /add user/i).click();
    cy.wait(500);
    // Target only the select elements that are NOT disabled (form selects, not table selects)
    cy.get('input[placeholder*="ame"]').last().clear().type(name);
    cy.get('input[type="email"]').last().clear().type(email);
    cy.get('input[type="password"]').last().clear().type(password);
    cy.get('select:not([disabled])').last().select(role);
    cy.contains('button', /create/i).click();
    cy.wait(1000);
  },
);

Then('I should see the admin dashboard with stats', () => {
  cy.get('main').should('be.visible');
  cy.get('main').find('[class*="grid"]').should('exist');
});

Then('the user {string} should appear in the users table', (name: string) => {
  cy.get('table, main').should('contain.text', name);
});

Then('I should not see admin content', () => {
  cy.url().should('not.include', '/admin');
});
