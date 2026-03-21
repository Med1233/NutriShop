# Testing Guide

## Overview

NutriShop uses a multi-layer testing strategy:

| Layer                  | Framework                       | Location                         | Tests                     |
| ---------------------- | ------------------------------- | -------------------------------- | ------------------------- |
| UI Components          | Vitest + Testing Library        | `packages/ui/src/*.test.tsx`     | 57                        |
| Frontend (API + Hooks) | Vitest + Testing Library        | `frontend/src/app/**/__tests__/` | 41                        |
| Backend Unit           | Vitest                          | `backend/tests/unit/`            | 25                        |
| Backend Integration    | Vitest + Supertest              | `backend/tests/integration/`     | 44                        |
| E2E (Gherkin)          | Cypress + cucumber-preprocessor | `e2e/cypress/e2e/features/`      | 6 features, ~20 scenarios |

**Total: 167 automated tests + E2E scenarios**

All tests run automatically in CI via GitHub Actions on pull requests (see [10-ci-cd.md](10-ci-cd.md)). Each test suite has its own workflow with path filtering — only relevant tests run when files change.

## Quick Start

```bash
# 1. Start the test database (required for backend integration tests)
docker-compose -f docker-compose.test.yml up -d

# 2. Run all backend tests (unit + integration)
pnpm --filter backend test

# 3. Run frontend tests (API client + hooks)
pnpm --filter frontend test

# 4. Run UI component tests
pnpm --filter @nutrishop/ui test

# 5. Run E2E tests (requires full stack)
docker-compose -f docker-compose.dev.yml up -d
cd e2e && pnpm cypress:run
```

## UI Component Tests (`packages/ui/`)

Tests for the `@nutrishop/ui` design system package.

```bash
pnpm --filter @nutrishop/ui test        # Run once
pnpm --filter @nutrishop/ui test:watch  # Watch mode
```

Each component has a co-located test file (`Button.test.tsx`, `Card.test.tsx`, etc.) covering:

- Rendering and children
- Variant/prop behavior
- User interactions (clicks, typing)
- Accessibility (roles, labels)

## Frontend Tests (`frontend/src/app/`)

Tests for the API client layer and custom hooks.

```bash
pnpm --filter frontend test        # Run once
pnpm --filter frontend test:watch  # Watch mode
```

### API Client Tests (`api/__tests__/`)

- `client.test.ts` (4 tests) — `getBackendUrl` env resolution, `apiFetch` credentials/headers merging
- `productApi.test.ts` (5 tests) — `fetchCategories`, `fetchProducts` with params, `fetchProduct` success/error
- `orderApi.test.ts` (5 tests) — `fetchMyOrders`, `fetchAllOrders` (array guard), `createOrder`, `updateOrderStatus`

### Hook Tests (`hooks/__tests__/`)

- `useProductCatalog.test.ts` (6 tests) — loads categories/products on mount, `isCustomer` logic, search/filter state, `handleAddToCart`
- `useProductDetail.test.ts` (5 tests) — loads product, handles fetch error, parses nutrition entries, `handleAdd` with quantity
- `useLogin.test.ts` (6 tests) — initial state, email/password setters, reads error from search params, submit success/failure, `showGoogle`
- `useRegister.test.ts` (4 tests) — initial state, password mismatch error, register success navigates, register failure sets error
- `useCheckout.test.ts` (6 tests) — subtotal calculation, address state, submit success/failure/network error, exposes auth state

All hooks are tested with mocked contexts (`useAuth`, `useCart`) and mocked API modules — no real network calls.

## Backend Unit Tests (`backend/tests/unit/`)

Pure function tests with no database dependency.

```bash
pnpm --filter backend test:unit
```

### `auth.test.js` (11 tests)

- `generateAccessToken` — JWT payload, expiry, default role
- `verifyAccessToken` — valid, invalid, tampered tokens
- `hashPassword` / `verifyPassword` — bcrypt hashing, salting
- `setTokenCookies` / `clearTokenCookies` — cookie options

### `middleware.test.js` (14 tests)

- `requireAuth` — missing token (401), invalid token (401), valid token (sets req.user)
- `optionalAuth` — no token (still calls next), valid token (sets user), invalid (ignores)
- `requireAdmin` — admin passes, non-admin gets 403
- `requireStaff` — admin/manager pass, others get 403
- `requireProductManager` — admin/stockist pass, others get 403

## Backend Integration Tests (`backend/tests/integration/`)

Full API route tests against a real Postgres database using Supertest.

```bash
# Start test DB first
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
pnpm --filter backend test:integration
```

### Test Database

- **Docker**: `docker-compose.test.yml` runs Postgres on **port 5433** with tmpfs (RAM-backed)
- **Connection**: `postgresql://admin:password@localhost:5433/appdb_test`
- **Schema**: Created by `tests/globalSetup.js` before tests run
- **Data**: Truncated between every test by `tests/setup.js`

### Test Helpers (`tests/helpers.js`)

- `createTestUser(overrides)` — inserts a user + returns `{ user, token, rawPassword }`
- `createTestProduct(overrides)` — inserts a product + returns it
- `resetDb()` — truncates all tables
- `authAgent(token)` — returns a supertest agent with auth cookie

### `auth.routes.test.js` (11 tests)

- Register: valid, duplicate email, missing fields, short password
- Login: valid credentials, wrong password, nonexistent email
- Me: with/without token
- Logout, Profile update

### `products.routes.test.js` (10 tests)

- List, filter by category, search by name
- Get single, 404 for missing
- Create as stockist (201), as customer (403), without auth (401)
- Update, Delete as admin

### `cart.routes.test.js` (9 tests)

- Auth required, empty cart
- Add item, increment on duplicate, insufficient stock, nonexistent product
- Update quantity, reject < 1
- Remove item

### `orders.routes.test.js` (8 tests)

- Create order (stock decremented, cart emptied)
- Reject empty cart, require auth
- List own orders, admin lists all
- Manager updates status, cancel restores stock
- Customer cannot update status

### `admin.routes.test.js` (6 tests)

- List users (admin), reject non-admin
- Create user, change role, delete user
- Get stats

## E2E Tests with Gherkin (`e2e/`)

End-to-end browser tests using Cypress with Gherkin `.feature` files.

```bash
# Start the full stack
docker-compose -f docker-compose.dev.yml up -d

# Interactive mode (opens Cypress UI)
cd e2e && pnpm cypress:open

# Headless mode (CI)
cd e2e && pnpm cypress:run
```

### Features

| Feature File       | Scenarios                                      |
| ------------------ | ---------------------------------------------- |
| `auth.feature`     | Register, login (valid/invalid), logout        |
| `products.feature` | View listing, search, product detail           |
| `cart.feature`     | Add to cart, view cart, remove item            |
| `checkout.feature` | Place order, checkout requires login           |
| `orders.feature`   | View order history, manager updates status     |
| `admin.feature`    | View dashboard, create user, non-admin blocked |

### Step Definitions

Located in `e2e/cypress/e2e/step_definitions/`. Each feature has a matching step definition file.

### Custom Commands (`cypress/support/commands.ts`)

- `cy.login(email, password)` — login via API (sets cookies)
- `cy.loginAsAdmin()` — login as default admin
- `cy.seedUser(data)` — create a user directly in DB via `cy.task`
- `cy.resetDb()` — truncate transactional data via `cy.task`

### DB Tasks

Defined in `cypress.config.ts`:

- `db:reset` — truncates cart_items, order_items, orders, refresh_tokens
- `db:seed-user` — inserts/upserts a user with hashed password

## Writing New Tests

### Adding a backend unit test

1. Create `backend/tests/unit/your-module.test.js`
2. Use `vi.fn()` / `vi.mock()` to mock dependencies
3. Globals (`describe`, `it`, `expect`, `vi`) are auto-injected (no imports needed)

### Adding a backend integration test

1. Create `backend/tests/integration/your-routes.test.js`
2. Import from `../helpers` for `createTestUser`, `createTestProduct`, `app`
3. DB is automatically reset between tests

### Adding a UI component test

1. Create `packages/ui/src/YourComponent.test.tsx`
2. Use `render`, `screen`, `userEvent` from Testing Library
3. Run with `pnpm --filter @nutrishop/ui test`

### Adding an E2E scenario

1. Add scenario to an existing `.feature` file or create a new one in `e2e/cypress/e2e/features/`
2. Add step definitions in `e2e/cypress/e2e/step_definitions/`
3. Reuse existing steps where possible (e.g., `Given I am logged in as a customer`)
