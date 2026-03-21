Feature: User Authentication

  Background:
    Given the database is clean

  Scenario: Register a new account
    Given I am on the registration page
    When I fill in "name" with "Test User"
    And I fill in "email" with "register-test@test.com"
    And I fill in "password" with "password123"
    And I fill in "confirmPassword" with "password123"
    And I click the submit button
    Then I should be redirected to the home page
    And I should see "Test User" in the navigation

  Scenario: Login with valid credentials
    Given a user exists with email "login@test.com" and password "pass1234"
    And I am on the login page
    When I fill in "email" with "login@test.com"
    And I fill in "password" with "pass1234"
    And I click the submit button
    Then I should be redirected to the home page

  Scenario: Login with invalid credentials
    Given I am on the login page
    When I fill in "email" with "wrong@test.com"
    And I fill in "password" with "wrongpass"
    And I click the submit button
    Then I should see an error alert

  Scenario: Logout
    Given a user exists with email "logout@test.com" and password "pass1234"
    And I am logged in as "logout@test.com" with password "pass1234"
    And I am on the home page
    When I click the logout button
    Then I should see the sign in link
