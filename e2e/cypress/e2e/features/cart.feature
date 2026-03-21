Feature: Shopping Cart

  Background:
    Given products exist in the database

  Scenario: Logged-in user adds item to cart
    Given a customer user exists
    And I am logged in as a customer
    And I am on the home page
    When I click "Add to Cart" on the first product
    Then the cart badge should show at least 1 item

  Scenario: View cart contents
    Given a customer user exists
    And I am logged in as a customer
    And I have added a product to my cart
    When I navigate to the cart page
    Then I should see the product in my cart

  Scenario: Remove item from cart
    Given a customer user exists
    And I am logged in as a customer
    And I have added a product to my cart
    When I navigate to the cart page
    And I click remove on the item
    Then the cart should show empty
