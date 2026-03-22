# NutriShop Documentation

Welcome to the NutriShop documentation — a full-stack e-commerce platform for nutrition products.

## Overview

NutriShop is built with **Next.js**, **Express**, and **PostgreSQL**, orchestrated via Docker. It features a shared design system, role-based access, AI-powered chat, email verification, and internationalization (EN/FR/AR).

## Quick Links

| Topic                                              | Description                              |
| -------------------------------------------------- | ---------------------------------------- |
| [Architecture](01-architecture.md)                 | System diagram, services, data flow      |
| [Frontend](04-frontend.md)                         | Next.js pages, hooks, API client         |
| [Backend](05-backend.md)                           | Express routes, middleware, database     |
| [E-Commerce](07-ecommerce.md)                      | Products, cart, orders, stock management |
| [Authentication](02-authentication.md)             | JWT, OAuth, roles, session handling      |
| [Email Verification](13-email-verification.md)     | Resend integration, verification flow    |
| [AI Chatbot](12-chatbot.md)                        | NutriBot with Claude, SSE streaming      |
| [Internationalization](03-internationalization.md) | i18n with EN, FR, AR (RTL)               |
| [Design System](09-design-system.md)               | @nutrishop/ui components, Storybook      |
| [Testing](08-testing.md)                           | Vitest, Cypress + Gherkin, 167+ tests    |
| [CI/CD](10-ci-cd.md)                               | GitHub Actions, 7 workflows              |
| [Deployment](11-deployment.md)                     | DigitalOcean, Nginx, SSL                 |

## Running Locally

```bash
# Development (hot-reload)
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Storybook: http://localhost:6006
