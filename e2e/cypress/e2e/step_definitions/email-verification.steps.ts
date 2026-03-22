import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

const UNVERIFIED_USER = {
  email: 'unverified@test.com',
  password: 'pass1234',
  name: 'Unverified User',
  role: 'customer' as const,
  email_verified: false,
};

const VERIFIED_USER = {
  email: 'verified@test.com',
  password: 'pass1234',
  name: 'Verified User',
  role: 'customer' as const,
  email_verified: true,
};

Given('an unverified user exists', () => {
  cy.seedUser(UNVERIFIED_USER);
});

Given('a verified user exists', () => {
  cy.seedUser(VERIFIED_USER);
});

Given('I am logged in as the unverified user', () => {
  cy.login(UNVERIFIED_USER.email, UNVERIFIED_USER.password);
});

Given('I am logged in as the verified user', () => {
  cy.login(VERIFIED_USER.email, VERIFIED_USER.password);
});

Given('a verification token exists for the unverified user', () => {
  cy.createVerificationToken(UNVERIFIED_USER.email).as('verificationToken');
});

When('I visit the verification link', () => {
  cy.get('@verificationToken').then((token) => {
    cy.visit(`/verify-email?token=${token}`);
  });
});

When('I visit {string}', (path: string) => {
  cy.visit(path);
});

Then('I should see the verification banner', () => {
  cy.get('[class*="amber"]')
    .contains(/verify/i)
    .should('be.visible');
});

Then('I should not see the verification banner', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[class*="amber"]').length) {
      cy.get('[class*="amber"]').should('not.contain.text', 'verify');
    }
  });
});

Then('I should see a verification required error', () => {
  cy.wait(1000);
  cy.get('main').should('contain.text', 'verif');
});

Then('I should see the verification success message', () => {
  cy.get('main', { timeout: 10000 }).should('contain.text', 'verified');
});

Then('I should see the verification failed message', () => {
  cy.get('main', { timeout: 10000 }).should('contain.text', 'Invalid');
});
