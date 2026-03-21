Feature: Order Management

  Background:
    Given products exist in the database

  Scenario: Customer views order history
    Given a customer user exists
    And I am logged in as a customer
    And I have placed an order
    When I navigate to my profile
    And I click the "Orders" tab
    Then I should see my order in the list

  Scenario: Manager updates order status
    Given a customer user exists
    And a manager user exists
    And a customer has placed an order
    And I am logged in as a manager
    When I navigate to the manager page
    Then I should see the order
    When I change the order status to "processing"
    Then the order status should update
