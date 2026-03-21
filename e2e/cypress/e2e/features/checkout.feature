Feature: Checkout

  Background:
    Given products exist in the database

  Scenario: Place an order
    Given a customer user exists
    And I am logged in as a customer
    And I have added a product to my cart
    When I navigate to the checkout page
    And I fill in the shipping address with "123 Main St, Test City"
    And I click "Place Order"
    Then I should see an order confirmation

  Scenario: Checkout requires login
    When I navigate directly to "/checkout"
    Then I should be redirected to the login page
