# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Stack

### Development (hot-reload)

```bash
docker-compose -f docker-compose.dev.yml up          # Start with hot-reload
docker-compose -f docker-compose.dev.yml down         # Stop
docker-compose -f docker-compose.dev.yml down -v      # Stop + remove volumes (resets deps & DB)
```

- Frontend and backend source files are mounted as volumes — changes reflect instantly
- Backend uses `nodemon` for auto-restart on `.js` changes
- Frontend uses `next dev` for hot-reload on `.tsx` changes
- `node_modules` are stored in named Docker volumes (not on host)
- Package manager: **pnpm** (enabled via corepack inside Docker containers)

### Production

```bash
docker-compose up --build   # Build and start all services
docker-compose up           # Start without rebuilding
docker-compose down         # Stop and remove containers
docker-compose down -v      # Also remove the postgres volume
```

### URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Postgres: localhost:5432
- Storybook (design system): http://localhost:6006 (run `pnpm --filter @nutrishop/ui storybook`)

## Monorepo Structure

This is a **pnpm workspace** monorepo (`pnpm-workspace.yaml` at root).

```
project-root/
├── frontend/          # Next.js 14 App Router
├── backend/           # Express API server
├── packages/
│   └── ui/            # @nutrishop/ui — shared design system
├── e2e/               # Cypress E2E tests with Gherkin
├── pnpm-workspace.yaml
├── docker-compose.yml          # Production
├── docker-compose.dev.yml      # Development (hot-reload)
└── docker-compose.test.yml     # Test database (port 5433)
```

## Architecture

Three Docker services coordinated via a named volume and healthcheck-based startup ordering:

```
postgres (healthcheck) → backend → frontend
```

**Backend** (`backend/src/`): Express app on port 4000. `app.js` exports the Express app (for testing), `index.js` starts the server. Manages database schema (users, refresh_tokens, products, cart_items, orders, order_items tables), authentication (local + Google OAuth), product catalog, shopping cart, and order management. Uses `pg` Pool for Postgres, `bcryptjs` for password hashing, `jsonwebtoken` for JWTs, and HttpOnly cookies for session management.

**Frontend** (`frontend/src/app/`): Next.js 14 App Router with client components. NutriShop e-commerce storefront for nutrition products. Organized into layers:
- `types/` — shared TypeScript interfaces and constants (Product, Order, User, CartItem, etc.)
- `api/` — centralized API client and endpoint functions (productApi, orderApi, adminApi)
- `hooks/` — custom hooks extracting business logic from pages (useProductCatalog, useCheckout, etc.)
- `context/` — React contexts (AuthContext, CartContext) importing from `types/` and `api/`
- Pages are thin UI-only components that consume hooks and render JSX

**Design System** (`packages/ui/`): `@nutrishop/ui` — framework-agnostic React component library with Tailwind CSS. Includes Storybook and Vitest tests. The frontend imports it as a workspace dependency (`"@nutrishop/ui": "workspace:*"`) and transpiles it via `transpilePackages` in `next.config.js`.

**Config**: Secrets and connection strings live in `.env` at the project root, consumed by both `docker-compose.yml` and `docker-compose.dev.yml`.

## Environment Variables

| Variable | Used by | Purpose |
|---|---|---|
| `POSTGRES_USER/PASSWORD/DB` | postgres | DB credentials |
| `DATABASE_URL` | backend | Postgres connection string |
| `JWT_SECRET` | backend | Signs access tokens |
| `JWT_REFRESH_SECRET` | backend | Reserved for refresh token signing |
| `GOOGLE_CLIENT_ID` | backend + frontend | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | backend | Google OAuth secret |
| `GOOGLE_CALLBACK_URL` | backend | Google OAuth redirect URI |
| `FRONTEND_URL` | backend | CORS origin + OAuth redirect target |
| `BACKEND_URL` | frontend (server) | Backend URL for server-side requests |
| `NEXT_PUBLIC_BACKEND_URL` | frontend (browser) | Backend URL for client-side requests |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | frontend (browser) | Controls Google button visibility |

## Testing

### Running Tests

```bash
# Design system UI component tests (57 tests)
pnpm --filter @nutrishop/ui test

# Frontend tests — API client, hooks (41 tests)
pnpm --filter frontend test

# Backend unit tests (25 tests — auth helpers, middleware)
docker-compose -f docker-compose.test.yml up -d    # start test DB on port 5433
pnpm --filter backend test:unit

# Backend integration tests (44 tests — all API routes with real DB)
docker-compose -f docker-compose.test.yml up -d    # start test DB on port 5433
pnpm --filter backend test:integration

# All backend tests (unit + integration)
docker-compose -f docker-compose.test.yml up -d
pnpm --filter backend test

# E2E tests with Gherkin/Cypress (requires full stack running)
docker-compose -f docker-compose.dev.yml up -d     # start app
cd e2e && pnpm cypress:open                        # interactive mode
cd e2e && pnpm cypress:run                         # headless CI mode
```

### Test Architecture

| Layer | Framework | Location | Count |
|---|---|---|---|
| UI Components | Vitest + Testing Library | `packages/ui/src/*.test.tsx` | 57 |
| Frontend (API + Hooks) | Vitest + Testing Library | `frontend/src/app/**/__tests__/` | 41 |
| Backend Unit | Vitest | `backend/tests/unit/` | 25 |
| Backend Integration | Vitest + Supertest | `backend/tests/integration/` | 44 |
| E2E (Gherkin) | Cypress + cucumber-preprocessor | `e2e/cypress/e2e/features/` | 6 features |

- **Frontend tests**: API client functions (`client.test.ts`, `productApi.test.ts`, `orderApi.test.ts`) and custom hooks (`useProductCatalog`, `useProductDetail`, `useLogin`, `useRegister`, `useCheckout`). All mocked — no real API calls.
- **Test DB**: `docker-compose.test.yml` runs a Postgres on port 5433 with tmpfs (RAM-backed, fast). Backend tests use `postgresql://admin:password@localhost:5433/appdb_test`.
- **Backend integration tests** use Supertest against the Express app (`backend/src/app.js`) — no server needed. The `globalSetup.js` creates the schema, `setup.js` truncates data between tests.
- **E2E Gherkin features**: `auth.feature`, `products.feature`, `cart.feature`, `checkout.feature`, `orders.feature`, `admin.feature`. Step definitions in `e2e/cypress/e2e/step_definitions/`.

## Design System (`@nutrishop/ui`)

Standalone package at `packages/ui/` with its own Tailwind config, Storybook, and tests.

```bash
pnpm --filter @nutrishop/ui storybook       # Launch Storybook on port 6006
pnpm --filter @nutrishop/ui test            # Run component tests
pnpm --filter @nutrishop/ui lint            # Type-check
```

**Components**: Button, LinkButton (polymorphic `as` prop), Input, Textarea, Select, FormField, FormRow, Card, CardHeader, Badge, CategoryBadge, StatusBadge, ProviderBadge, StatCard, StatGrid, Table, Th, Td, PageTitle, EmptyState, FilterPills, Tabs, Alert, DetailPanel, ToggleButton.

**Key pattern**: `LinkButton` uses an `as` prop to remain framework-agnostic. In the frontend, pass `as={Link}` from `next/link` for client-side routing. `EmptyState` accepts `linkComponent` for the same reason.

**Tailwind**: The frontend's `tailwind.config.js` scans both `./src/**` and `../packages/ui/src/**` to include classes from the design system.

## Key Conventions

- **Auth**: All auth endpoints under `/api/auth/*`. Protected routes use `requireAuth` middleware. Admin routes use `requireAdmin`.
- **Roles**: Four roles — `customer` (default, can browse/cart/order), `manager` (can view/update all orders), `stockist` (can add/edit/delete products), and `admin` (full access). Only customers see cart/add-to-cart. Default admin: `macinessa365@gmail.com` / `123456`.
- **Order stock flow**: Stock is decremented when the order is created. Cancelling an order restores stock. Statuses: pending → processing → shipped → delivered, or cancelled at any point.
- **E-commerce**: Products are public (`/api/products`). Guest users can add to cart (stored in localStorage); on login, guest cart merges into backend cart. Orders (`/api/orders`) require authentication.
- **Cookies**: Access token (15min, path `/`) + refresh token (7d, path `/api/auth`), both HttpOnly.
- **i18n**: All UI strings in `frontend/src/app/i18n/translations.ts`. Use `t('key')` via `useLanguage()` hook. Arabic triggers RTL layout.
- **Styling**: Tailwind CSS. Brand color: `#16a34a` (green). Design system components in `@nutrishop/ui`.
- **Package manager**: pnpm with workspace. Use `pnpm --filter <package> <command>` to run scripts in specific packages.
- **Docker**: Use `docker-compose.dev.yml` for development (hot-reload), `docker-compose.yml` for production builds, `docker-compose.test.yml` for test database.
- **Database**: 6 tables — users (with role column), refresh_tokens, products, cart_items, orders, order_items. Products seeded with 12 nutrition items + default admin user on first run.
- **Documentation**: Update `docs/` and this file whenever the architecture, config, or features change.

## Frontend Pages

| Route | Page | Auth Required |
|---|---|---|
| `/` | Product catalog (hero, search, category filter, product grid with SVG images) | No |
| `/products/:id` | Product detail with SVG image, nutrition facts | No |
| `/cart` | Shopping cart with product images, quantity editing | No (guest cart via localStorage) |
| `/checkout` | Order placement with shipping address | Yes |
| `/profile` | Profile page — editable personal info (name, phone, address); orders tab for customers only | Yes |
| `/manager` | Order management (view all, change status, filter) | Manager or Admin |
| `/stockist` | Product management (add, edit, delete, stock tracking) | Stockist or Admin |
| `/admin` | Admin panel (manage products, users, orders) | Admin only |
| `/login` | Email/password + Google OAuth login | No |
| `/register` | Account registration | No |

## Backend Routes

| Mount Point | File | Auth | Purpose |
|---|---|---|---|
| `/api/auth` | `routes/auth.js` | Mixed | Authentication (register, login, OAuth, etc.) |
| `/api/products` | `routes/products.js` | Public | Product catalog (list, search, detail) |
| `/api/cart` | `routes/cart.js` | Required | Cart CRUD (add, update qty, remove) |
| `/api/orders` | `routes/orders.js` | Required | Order creation and history; staff (admin/manager) can list all + update status |
| `/api/admin` | `routes/admin.js` | Admin | User management (list, delete, role change) + stats |
