# AI Chatbot (NutriBot)

## Overview

NutriBot is an AI-powered customer assistant built into NutriShop. It uses the **Anthropic Claude API** (Haiku 4.5 model) to provide real-time streaming responses about products, nutrition, and order status.

## Architecture

```
ChatWidget (React) → POST /api/chat → Express backend → Claude Haiku API
                                            ↓
                                   Query products/orders from DB
                                            ↓
                                   Stream response via SSE
```

- **Backend** streams responses using Server-Sent Events (SSE)
- **Frontend** renders chunks in real-time as they arrive
- **Product catalog** is included in the system prompt from the database
- **Order data** is included only for authenticated users

## Capabilities

| User type     | Can ask about                                             |
| ------------- | --------------------------------------------------------- |
| **Guest**     | Product recommendations, nutrition questions, comparisons |
| **Logged in** | All of the above + order status, order history            |

## Backend — `POST /api/chat`

**File:** `backend/src/routes/chat.js`

**Request:**

```json
{
  "messages": [
    { "role": "user", "content": "What protein do you recommend?" },
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "Which one is best for weight loss?" }
  ],
  "locale": "en"
}
```

**Response:** SSE stream

```
data: {"text":"I'd recommend"}
data: {"text":" the Whey Protein"}
data: {"text":" Isolate..."}
data: [DONE]
```

**Security:**

- CSRF protected (requires `X-CSRF-Token` header)
- Rate limited: 20 requests per minute per IP
- Input validation: max 50 messages, max 10,000 total characters
- `optionalAuth` middleware — works for guests and logged-in users

**System prompt includes:**

- Full product catalog (name, price, category, stock, nutrition info)
- User's recent orders (if authenticated, up to 10)
- Language instruction based on locale (English, French, or Arabic)

## Frontend

### ChatWidget (`frontend/src/app/components/ChatWidget.tsx`)

Floating chat bubble in the bottom-right corner (bottom-left for RTL). Opens a chat panel with:

- Message list with auto-scroll
- Text input with Enter to send
- Stop button during streaming
- Clear chat button
- Typing indicator (bouncing dots)
- RTL support for Arabic

### useChat hook (`frontend/src/app/hooks/useChat.ts`)

Manages chat state:

- `messages` — conversation history (session-only, not persisted)
- `isOpen` / `toggleChat()` — widget open/close
- `isStreaming` / `stopStreaming()` — streaming control with AbortController
- `sendMessage(text)` — sends message and streams response
- `clearHistory()` — resets conversation

### chatApi (`frontend/src/app/api/chatApi.ts`)

SSE stream parser. Reads `response.body` as a `ReadableStream`, parses `data:` lines, and calls `onChunk` for each text delta. Supports `AbortSignal` for cancellation.

## Configuration

| Variable            | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `ANTHROPIC_API_KEY` | Claude API key (from https://console.anthropic.com) |

## Cost

- **Model:** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`)
- **~$0.005 per conversation** (input: $0.80/M tokens, output: $4/M tokens)
- Product catalog context is ~2,000 tokens per request
- `max_tokens` limited to 512 per response

## i18n

Chat translations available for EN, FR, AR:

- `chat.title` — widget header
- `chat.placeholder` — input placeholder
- `chat.send` / `chat.clear` — button labels
- `chat.greeting` — initial greeting message
