Feature: Email Verification

  Background:
    Given the database is clean

  Scenario: Unverified user sees verification banner
    Given an unverified user exists
    And I am logged in as the unverified user
    When I am on the home page
    Then I should see the verification banner

  Scenario: Verified user does not see verification banner
    Given a verified user exists
    And I am logged in as the verified user
    When I am on the home page
    Then I should not see the verification banner

  Scenario: Unverified user cannot checkout
    Given products exist in the database
    And an unverified user exists
    And I am logged in as the unverified user
    And I have added a product to my cart
    When I navigate to the checkout page
    And I fill in the shipping address with "123 Test St"
    And I click "Place Order"
    Then I should see a verification required error

  Scenario: Verify email via verification link
    Given an unverified user exists
    And a verification token exists for the unverified user
    When I visit the verification link
    Then I should see the verification success message

  Scenario: Invalid verification token shows error
    When I visit "/verify-email?token=invalidtoken123"
    Then I should see the verification failed message
