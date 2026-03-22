import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('I click the chat widget button', () => {
  cy.get('button[aria-label*="Chat"], button[aria-label*="chat"]')
    .first()
    .click();
});

Then('I should see the chat widget button', () => {
  cy.get('button[aria-label*="Chat"], button[aria-label*="chat"]').should(
    'be.visible',
  );
});

Then('I should see the chat panel with a greeting', () => {
  cy.get('[class*="rounded-2xl"]')
    .contains(/nutribot|chat/i)
    .should('be.visible');
});

Then('the chat panel should be closed', () => {
  cy.get('body').then(($body) => {
    const panels = $body.find('[class*="h-\\[500px\\]"]');
    expect(panels.length).to.eq(0);
  });
});

When('I type {string} in the chat input', (text: string) => {
  cy.get('input[placeholder]').last().clear().type(text);
});

When('I press Enter in the chat input', () => {
  cy.get('input[placeholder]').last().type('{enter}');
});

Then('I should see my message {string} in the chat', (text: string) => {
  cy.get('[class*="bg-green-600"][class*="text-white"][class*="rounded-xl"]')
    .contains(text)
    .should('be.visible');
});

When('I click the clear chat button', () => {
  cy.contains('button', /clear/i).click();
});

Then('I should see the chat greeting again', () => {
  cy.get('[class*="bg-green-50"]').should('be.visible');
});
