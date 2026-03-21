import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('a customer user exists', () => {
  cy.seedUser({ email: 'customer@test.com', password: 'pass1234', name: 'Customer', role: 'customer' });
});

Given('I am logged in as a customer', () => {
  cy.login('customer@test.com', 'pass1234');
});

Given('I have added a product to my cart', () => {
  cy.visit('/');
  cy.contains('button', /add to cart/i).first().click();
  cy.wait(500);
});

When('I click {string} on the first product', (btnText: string) => {
  cy.contains('button', new RegExp(btnText, 'i')).first().click();
});

When('I navigate to the cart page', () => {
  cy.visit('/cart');
});

When('I click remove on the item', () => {
  cy.contains('button', /remove/i).first().click();
});

Then('the cart badge should show at least 1 item', () => {
  cy.wait(500);
  cy.get('nav').find('[class*="badge"], [class*="rounded-full"]').should('exist');
});

Then('I should see the product in my cart', () => {
  cy.get('main').find('a[href*="/products/"]').should('have.length.greaterThan', 0);
});

Then('the cart should show empty', () => {
  cy.wait(1000);
  cy.get('main').should('contain.text', 'empty');
});
