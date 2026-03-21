Feature: Product Catalog

  Background:
    Given products exist in the database

  Scenario: View product listing
    Given I am on the home page
    Then I should see a list of products

  Scenario: Search for a product
    Given I am on the home page
    When I type "Whey" in the search box
    Then I should see products matching "Whey"

  Scenario: View product details
    Given I am on the home page
    When I click on the first product
    Then I should see the product detail page
