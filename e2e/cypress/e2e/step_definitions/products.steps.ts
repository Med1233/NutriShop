import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('products exist in the database', () => {
  // Products are seeded on app startup — just verify the API is reachable
  cy.request('http://localhost:4000/api/products').its('status').should('eq', 200);
});

Then('I should see a list of products', () => {
  cy.get('[class*="grid"]').children().should('have.length.greaterThan', 0);
});

When('I type {string} in the search box', (text: string) => {
  cy.get('input[type="text"]').first().clear().type(text);
});

Then('I should see products matching {string}', (text: string) => {
  cy.wait(500); // debounce
  cy.get('[class*="grid"]').should('contain.text', text);
});

When('I click on the first product', () => {
  cy.get('[class*="grid"] a').first().click();
});

Then('I should see the product detail page', () => {
  cy.url().should('match', /\/products\/\d+/);
  cy.get('h1').should('be.visible');
});
