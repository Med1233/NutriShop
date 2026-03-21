import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('a manager user exists', () => {
  cy.seedUser({ email: 'manager@test.com', password: 'pass1234', name: 'Manager', role: 'manager' });
});

Given('a customer has placed an order', () => {
  cy.login('customer@test.com', 'pass1234');
  cy.request({
    method: 'POST',
    url: 'http://localhost:4000/api/cart',
    body: { product_id: 1, quantity: 1 },
  });
  cy.request({
    method: 'POST',
    url: 'http://localhost:4000/api/orders',
    body: { shipping_address: '123 Test St' },
  });
});

Given('I am logged in as a manager', () => {
  cy.login('manager@test.com', 'pass1234');
});

When('I navigate to my profile', () => {
  cy.visit('/profile');
});

When('I navigate to the manager page', () => {
  cy.visit('/manager');
});

When('I click the {string} tab', (tabName: string) => {
  cy.contains('button', new RegExp(tabName, 'i')).click();
});

When('I change the order status to {string}', (status: string) => {
  cy.get('select').first().select(status);
});

Then('I should see my order in the list', () => {
  cy.get('main').should('contain.text', '#');
});

Then('I should see the order', () => {
  cy.get('main').find('[class*="border"]').should('have.length.greaterThan', 0);
});

Then('the order status should update', () => {
  cy.wait(500);
  cy.get('select').first().should('not.have.value', 'pending');
});
