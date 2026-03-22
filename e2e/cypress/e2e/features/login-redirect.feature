Feature: Login Redirect

  Background:
    Given the database is clean

  Scenario: Admin is redirected to admin page after login
    Given I am on the login page
    When I login as admin via the form
    Then I should be redirected to "/admin"

  Scenario: Manager is redirected to manager page after login
    Given a manager user exists
    And I am on the login page
    When I fill in "email" with "manager@test.com"
    And I fill in "password" with "pass1234"
    And I click the submit button
    Then I should be redirected to "/manager"

  Scenario: Customer is redirected to home page after login
    Given a user exists with email "customer@test.com" and password "pass1234"
    And I am on the login page
    When I fill in "email" with "customer@test.com"
    And I fill in "password" with "pass1234"
    And I click the submit button
    Then I should be redirected to the home page

  Scenario: Unauthenticated user on checkout is returned after login
    Given products exist in the database
    And a customer user exists
    When I navigate directly to "/checkout"
    Then I should be on the login page with redirect "/checkout"
    When I fill in "email" with "customer@test.com"
    And I fill in "password" with "pass1234"
    And I click the submit button
    Then I should be redirected to "/checkout"

  Scenario: Redirect param is preserved from login to register
    When I visit "/login?redirect=/checkout"
    And I click the register link
    Then I should be on the register page with redirect "/checkout"
