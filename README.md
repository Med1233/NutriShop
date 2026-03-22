# NutriShop

A full-stack e-commerce platform for nutrition products, built with Next.js, Express, and PostgreSQL.

## Features

- **Product Catalog** — Browse, search, and filter nutrition products by category
- **Shopping Cart** — Guest cart (localStorage) with automatic merge on login
- **Order Management** — Place orders, track status, manage stock
- **Authentication** — Email/password + Google OAuth, email verification via Resend
- **Role-Based Access** — Customer, Manager, Stockist, and Admin roles
- **AI Chatbot** — NutriBot powered by Claude, with product and order context
- **Internationalization** — English, French, and Arabic (RTL) support
- **Design System** — Shared `@nutrishop/ui` component library with Storybook

## Tech Stack

| Layer         | Technology                                        |
| ------------- | ------------------------------------------------- |
| Frontend      | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend       | Express.js, Node.js                               |
| Database      | PostgreSQL 16                                     |
| Design System | React, Tailwind CSS, Storybook, Vitest            |
| Auth          | JWT (HttpOnly cookies), Google OAuth 2.0          |
| Email         | Resend API                                        |
| AI            | Claude Haiku 4.5 (SSE streaming)                  |
| Testing       | Vitest, Cypress + Gherkin, Testing Library        |
| CI/CD         | GitHub Actions (7 workflows), Docker              |
| Deployment    | DigitalOcean, Nginx, Let's Encrypt SSL            |

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Node.js 20+](https://nodejs.org/) and [pnpm](https://pnpm.io/)

### 1. Clone and configure

```bash
git clone https://github.com/your-username/nutrishop.git
cd nutrishop
cp .env.example .env   # Edit with your credentials
```

### 2. Start development

```bash
docker-compose -f docker-compose.dev.yml up
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

### 3. Start production

```bash
docker-compose up --build
```

## Environment Variables

Create a `.env` file in the project root:

```env
# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=appdb
DATABASE_URL=postgresql://admin:password@postgres:5432/appdb

# Auth
JWT_SECRET=your-random-64-char-string
JWT_REFRESH_SECRET=another-random-64-char-string

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# URLs
FRONTEND_URL=http://localhost:3000

# Default admin account
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password
ADMIN_NAME=Admin

# AI Chatbot
ANTHROPIC_API_KEY=

# Email verification
RESEND_API_KEY=
EMAIL_FROM=NutriShop <onboarding@resend.dev>
```

## Project Structure

```
nutrishop/
├── frontend/                  # Next.js 14 App Router
├── backend/                   # Express API server
├── packages/ui/               # @nutrishop/ui design system
├── e2e/                       # Cypress E2E tests (Gherkin)
├── docs/                      # Documentation
├── .github/workflows/         # CI/CD (7 workflows)
├── docker-compose.yml         # Production
├── docker-compose.dev.yml     # Development (hot-reload)
└── docker-compose.test.yml    # Test database
```

## Testing

```bash
# UI component tests
pnpm --filter @nutrishop/ui test

# Frontend tests
pnpm --filter frontend test

# Backend tests (start test DB first)
docker-compose -f docker-compose.test.yml up -d
pnpm --filter backend test

# E2E tests (start full stack first)
docker-compose -f docker-compose.dev.yml up -d
cd e2e && pnpm cypress:run
```

| Layer               | Framework                | Tests                    |
| ------------------- | ------------------------ | ------------------------ |
| UI Components       | Vitest + Testing Library | 57                       |
| Frontend            | Vitest + Testing Library | 41                       |
| Backend Unit        | Vitest                   | 25                       |
| Backend Integration | Vitest + Supertest       | 44                       |
| E2E                 | Cypress + Gherkin        | 8 features, 26 scenarios |

## Linting & Formatting

```bash
pnpm lint          # ESLint check
pnpm lint:fix      # Auto-fix
pnpm format        # Format with Prettier
pnpm format:check  # Check formatting
```

## Design System

The `@nutrishop/ui` package provides shared components used by the frontend.

```bash
pnpm --filter @nutrishop/ui storybook   # Launch Storybook on port 6006
```

Components include: Button, Input, Card, Badge, Table, Tabs, Alert, FormField, EmptyState, FilterPills, and more.

## Documentation

Full documentation is available in [`docs/`](docs/)

```bash
npx docsify-cli serve docs --port 4500
```

| Section                                                 | Topics                              |
| ------------------------------------------------------- | ----------------------------------- |
| [Architecture](docs/01-architecture.md)                 | System diagram, services, data flow |
| [Authentication](docs/02-authentication.md)             | JWT, OAuth, roles, sessions         |
| [Internationalization](docs/03-internationalization.md) | EN, FR, AR with RTL                 |
| [Frontend](docs/04-frontend.md)                         | Pages, hooks, API client            |
| [Backend](docs/05-backend.md)                           | Routes, middleware, database        |
| [E-Commerce](docs/07-ecommerce.md)                      | Products, cart, orders, stock       |
| [Testing](docs/08-testing.md)                           | All test layers and strategies      |
| [Design System](docs/09-design-system.md)               | Components, Storybook               |
| [CI/CD](docs/10-ci-cd.md)                               | GitHub Actions workflows            |
| [Deployment](docs/11-deployment.md)                     | DigitalOcean, Nginx, SSL            |
| [AI Chatbot](docs/12-chatbot.md)                        | NutriBot, Claude, SSE               |
| [Email Verification](docs/13-email-verification.md)     | Resend, verification flow           |

## License

This project is private and not licensed for public use.
