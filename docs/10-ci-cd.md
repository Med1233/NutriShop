# CI/CD — GitHub Actions

## Overview

The project uses **GitHub Actions** for continuous integration. Each workflow is a separate file in `.github/workflows/` and triggers only on **pull requests** when relevant files change (path-filtered).

## Workflows

| Workflow               | File                 | Triggers on paths                                                          | What it does                                               |
| ---------------------- | -------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Lint & Format**      | `lint.yml`           | `**.js`, `**.ts`, `**.tsx`, `**.json`, `**.css`, config files              | Runs ESLint and Prettier check                             |
| **UI Component Tests** | `test-ui.yml`        | `packages/ui/**`                                                           | Runs `@nutrishop/ui` Vitest tests (57 tests)               |
| **Frontend Tests**     | `test-frontend.yml`  | `frontend/**`, `packages/ui/**`                                            | Runs frontend Vitest tests (41 tests)                      |
| **Backend Tests**      | `test-backend.yml`   | `backend/**`                                                               | Runs backend Vitest tests (69 tests) with Postgres service |
| **Frontend Build**     | `build-frontend.yml` | `frontend/**`, `packages/ui/**`                                            | Verifies `next build` succeeds                             |
| **Docker Build**       | `docker-build.yml`   | `frontend/**`, `backend/**`, `packages/ui/**`, Dockerfiles, docker-compose | Builds backend and frontend Docker images                  |
| **E2E Tests**          | `e2e.yml`            | `frontend/**`, `backend/**`, `packages/ui/**`, `e2e/**`                    | Full stack Cypress Gherkin tests with artifact uploads     |

## Path Filtering

Each workflow only runs when files it cares about change. For example:

- A **backend-only** change triggers: Lint, Backend Tests, Docker Build, E2E
- A **frontend-only** change triggers: Lint, Frontend Tests, Frontend Build, Docker Build, E2E
- A **UI package** change triggers: Lint, UI Tests, Frontend Tests, Frontend Build, Docker Build, E2E
- An **E2E test-only** change triggers: Lint, E2E

## Workflow Details

### Lint & Format

Runs the monorepo-wide ESLint and Prettier checks:

```bash
pnpm lint          # ESLint 9 flat config
pnpm format:check  # Prettier with Tailwind plugin
```

### Backend Tests

Uses a **Postgres service container** (port 5433) for integration tests:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
      POSTGRES_DB: appdb_test
```

### E2E Tests

Spins up the full stack in the GitHub Actions runner:

1. Postgres service container (port 5432)
2. Backend started with `node backend/src/index.js`
3. Frontend built and started with `next build && next start`
4. Cypress runs headless against `http://localhost:3000`

On failure, screenshots are uploaded as artifacts. Videos are uploaded on every run.

### Docker Build

Builds both images to verify Dockerfiles are valid:

- **Backend**: `docker build ./backend`
- **Frontend**: `docker build -f frontend/Dockerfile .` (uses monorepo root context for workspace dependency resolution)

## Linting & Formatting

### Tools

| Tool                        | Config file        | Purpose                          |
| --------------------------- | ------------------ | -------------------------------- |
| ESLint 9                    | `eslint.config.js` | Code quality and error detection |
| Prettier                    | `.prettierrc`      | Code formatting                  |
| prettier-plugin-tailwindcss | `.prettierrc`      | Tailwind class sorting           |

### ESLint Configuration

The flat config (`eslint.config.js`) handles multiple environments:

- **Backend JS** — Node.js globals
- **Frontend/UI TypeScript + React** — `typescript-eslint` + `eslint-plugin-react` + `eslint-plugin-react-hooks`
- **Config files** (`*.config.js`) — Node.js globals
- **Storybook stories** — Relaxed hooks rules for `render` functions
- **Test files** — Vitest globals (`describe`, `it`, `expect`, `vi`, etc.) + relaxed `no-explicit-any`
- **Prettier** — `eslint-config-prettier` disables conflicting rules

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Running Locally

```bash
pnpm lint            # Check for lint errors
pnpm lint:fix        # Auto-fix lint errors
pnpm format          # Format all files
pnpm format:check    # Check formatting without writing
```
