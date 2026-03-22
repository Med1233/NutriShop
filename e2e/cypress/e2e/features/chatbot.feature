Feature: AI Chatbot

  Scenario: Chat widget button is visible
    Given I am on the home page
    Then I should see the chat widget button

  Scenario: Open and close chat widget
    Given I am on the home page
    When I click the chat widget button
    Then I should see the chat panel with a greeting
    When I click the chat widget button
    Then the chat panel should be closed

  Scenario: Send a message in the chat
    Given I am on the home page
    When I click the chat widget button
    And I type "Hello" in the chat input
    And I press Enter in the chat input
    Then I should see my message "Hello" in the chat

  Scenario: Clear chat history
    Given I am on the home page
    When I click the chat widget button
    And I type "Hi" in the chat input
    And I press Enter in the chat input
    And I should see my message "Hi" in the chat
    When I click the clear chat button
    Then I should see the chat greeting again
