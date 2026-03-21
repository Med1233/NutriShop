Feature: Admin Panel

  Scenario: Admin views dashboard
    Given I am logged in as the default admin
    When I navigate to the admin page
    Then I should see the admin dashboard with stats

  Scenario: Admin creates a new user
    Given I am logged in as the default admin
    When I navigate to the admin page
    And I click on the "Users" tab
    And I create a user with name "New Manager" email "mgr@test.com" password "pass1234" role "manager"
    Then the user "New Manager" should appear in the users table

  Scenario: Non-admin cannot access admin page
    Given a customer user exists
    And I am logged in as a customer
    When I navigate to the admin page
    Then I should not see admin content
