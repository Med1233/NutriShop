# Architecture Overview

## System Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│              │     │              │     │              │
│   Frontend   │────►│   Backend    │────►│  PostgreSQL   │
│  (Next.js)   │     │  (Express)   │     │   Database   │
│  Port 3000   │     │  Port 4000   │     │  Port 5432   │
│              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       │                    │
       │              ┌─────┴──────┐
       │              │   Google   │
       │              │  OAuth 2.0 │
       └──────────────┤   Server   │
        (redirect)    └────────────┘
```

## Services

| Service    | Technology              | Port | Role                                                 |
| ---------- | ----------------------- | ---- | ---------------------------------------------------- |
| `frontend` | Next.js 14 (App Router) | 3000 | UI, client-side routing, i18n, e-commerce storefront |
| `backend`  | Express.js (Node 20)    | 4000 | REST API, auth, products, cart, orders               |
| `postgres` | PostgreSQL 16 Alpine    | 5432 | Data persistence                                     |

## Docker Compose Startup Order

```
postgres (healthcheck: pg_isready)
    └──► backend (depends_on: postgres healthy)
            └──► frontend (depends_on: backend)
```

PostgreSQL must pass its healthcheck before the backend starts. The backend must be running before the frontend starts.

## Communication Flow

### Server-Side (Docker internal network)

- Backend connects to Postgres via `DATABASE_URL` using the Docker hostname `postgres`
- Frontend's Next.js rewrite proxy connects to backend via `http://backend:4000`

### Client-Side (Browser)

- Auth API calls go **directly** to `http://localhost:4000` (not through the Next.js proxy) so that HttpOnly cookies set by the backend are correctly sent back on subsequent requests
- Product browsing, cart, and order API calls also go directly to the backend for cookie consistency

### Why Direct Backend Calls?

The Next.js rewrite proxy (`/api/*` → `http://backend:4000/api/*`) works for simple requests, but doesn't reliably forward browser cookies to the backend. Since the auth system relies on HttpOnly cookies set by port 4000 (especially during Google OAuth callback), all browser-to-API calls target `http://localhost:4000` directly. CORS is configured to allow this.

## Environment Variables

| Variable                       | Used By  | Purpose                                                    |
| ------------------------------ | -------- | ---------------------------------------------------------- |
| `POSTGRES_USER`                | postgres | Database superuser name                                    |
| `POSTGRES_PASSWORD`            | postgres | Database superuser password                                |
| `POSTGRES_DB`                  | postgres | Default database name                                      |
| `DATABASE_URL`                 | backend  | Full Postgres connection string                            |
| `JWT_SECRET`                   | backend  | Signs access tokens (JWT)                                  |
| `JWT_REFRESH_SECRET`           | backend  | Reserved for future refresh token signing                  |
| `GOOGLE_CLIENT_ID`             | backend  | Google OAuth app client ID                                 |
| `GOOGLE_CLIENT_SECRET`         | backend  | Google OAuth app secret                                    |
| `GOOGLE_CALLBACK_URL`          | backend  | Google OAuth redirect URI                                  |
| `FRONTEND_URL`                 | backend  | Allowed CORS origin + OAuth redirect target                |
| `BACKEND_URL`                  | frontend | Backend URL for server-side requests                       |
| `NEXT_PUBLIC_BACKEND_URL`      | frontend | Backend URL for browser requests (inlined at build)        |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | frontend | Controls Google button visibility (inlined at build)       |
| `ADMIN_EMAIL`                  | backend  | Default admin account email (seeded on first startup)      |
| `ADMIN_PASSWORD`               | backend  | Default admin account password                             |
| `ADMIN_NAME`                   | backend  | Default admin display name (optional, defaults to "Admin") |

## Project File Structure

```
claude/
├── .env                          # All environment variables
├── .gitignore                    # Git ignore rules
├── .dockerignore                 # Docker build context exclusions
├── .prettierrc                   # Prettier configuration
├── .prettierignore               # Prettier ignore rules
├── eslint.config.js              # ESLint 9 flat config (monorepo-wide)
├── package.json                  # Root workspace — lint & format scripts
├── pnpm-workspace.yaml           # pnpm workspace definition
├── docker-compose.yml            # Production service orchestration
├── docker-compose.dev.yml        # Development (hot-reload)
├── docker-compose.test.yml       # Test database (port 5433)
│
├── .github/workflows/            # GitHub Actions CI (path-filtered)
│   ├── lint.yml                  # Lint & format check
│   ├── test-ui.yml               # UI component tests
│   ├── test-frontend.yml         # Frontend tests
│   ├── test-backend.yml          # Backend tests (with Postgres)
│   ├── build-frontend.yml        # Next.js production build
│   ├── docker-build.yml          # Docker image builds
│   └── e2e.yml                   # E2E Cypress tests (full stack)
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js              # Express app entry point
│       ├── app.js                # Express app (exported for testing)
│       ├── db.js                 # Database pool + schema init + product seeding
│       ├── auth.js               # Auth utilities (JWT, bcrypt, cookies)
│       ├── middleware.js          # requireAuth / optionalAuth / role guards
│       └── routes/
│           ├── auth.js           # Authentication endpoints
│           ├── products.js       # Product catalog (public GET; admin POST/PUT/DELETE)
│           ├── cart.js           # Shopping cart endpoints (auth required)
│           ├── orders.js         # Order management (auth; admin can list all + update status)
│           └── admin.js          # Admin: user management + stats
│
├── frontend/
│   ├── Dockerfile                # Multi-stage build (uses monorepo root context)
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   └── src/app/
│       ├── layout.tsx            # Root layout (providers + navbar)
│       ├── page.tsx              # Home / product catalog (public)
│       ├── types/                # Shared TypeScript interfaces and constants
│       ├── api/                  # Centralized API client and endpoint functions
│       ├── hooks/                # Custom hooks extracting business logic from pages
│       ├── context/
│       │   ├── AuthContext.tsx    # Auth state management
│       │   └── CartContext.tsx    # Shopping cart state management
│       ├── i18n/
│       │   ├── translations.ts   # EN/FR/AR translation strings
│       │   └── LanguageContext.tsx# Language state + t() function
│       ├── components/
│       │   ├── Navbar.tsx        # Navigation bar (with cart badge)
│       │   ├── LanguageSelector.tsx # Language dropdown
│       │   └── ProductImage.tsx  # SVG product images by category
│       └── [pages]/              # Route pages (thin UI-only components)
│
├── packages/ui/                  # @nutrishop/ui design system
│   ├── package.json
│   ├── src/                      # Components, stories, and tests
│   └── .storybook/               # Storybook configuration
│
├── e2e/                          # Cypress E2E tests with Gherkin
│   ├── cypress.config.ts
│   └── cypress/
│       ├── e2e/features/         # .feature files
│       ├── e2e/step_definitions/ # Step definition files
│       └── support/              # Custom commands
│
└── docs/                         # Project documentation
    ├── 01-architecture.md
    ├── 02-authentication.md
    ├── 03-internationalization.md
    ├── 04-frontend.md
    ├── 05-backend.md
    ├── 06-deployment.md
    ├── 07-ecommerce.md
    ├── 08-testing.md
    ├── 09-design-system.md
    └── 10-ci-cd.md
```
