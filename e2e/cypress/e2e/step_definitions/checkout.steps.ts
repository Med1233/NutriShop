import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I have placed an order', () => {
  cy.visit('/');
  cy.contains('button', /add to cart/i)
    .first()
    .click();
  cy.wait(500);
  cy.visit('/checkout');
  cy.get('textarea').type('123 Test St');
  cy.contains('button', /place order/i).click();
  cy.wait(1000);
});

When('I navigate to the checkout page', () => {
  cy.visit('/checkout');
});

When('I navigate directly to {string}', (path: string) => {
  cy.visit(path);
});

When('I fill in the shipping address with {string}', (address: string) => {
  cy.get('textarea').clear().type(address);
});

When('I click {string}', (text: string) => {
  cy.contains('button, a', new RegExp(text, 'i')).first().click();
});

Then('I should see an order confirmation', () => {
  cy.wait(1000);
  cy.get('main').should('contain.text', 'Order');
});
