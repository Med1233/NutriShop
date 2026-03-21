# Deployment & Operations

## Quick Start

```bash
# Development (hot-reload)
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up --build

# Access the app
# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
# Postgres: localhost:5432
```

## Two Docker Compose Configurations

The project has two compose files for different workflows:

| File                     | Purpose                     | When to use                |
| ------------------------ | --------------------------- | -------------------------- |
| `docker-compose.dev.yml` | Development with hot-reload | Day-to-day coding          |
| `docker-compose.yml`     | Production builds           | Deploying or final testing |

### Development Mode (`docker-compose.dev.yml`)

Uses the base `node:20-alpine` image directly (no Dockerfile build). Source code is mounted as volumes, so file changes reflect immediately:

- **Frontend**: Runs `next dev` — hot-reloads `.tsx` changes in the browser instantly
- **Backend**: Runs `nodemon` — auto-restarts on `.js` file changes
- **node_modules**: Stored in named Docker volumes (`backend_node_modules`, `frontend_node_modules`), not on the host filesystem

```bash
# Start dev environment
docker-compose -f docker-compose.dev.yml up

# Stop
docker-compose -f docker-compose.dev.yml down

# Reset everything (deps + database)
docker-compose -f docker-compose.dev.yml down -v
```

When to rebuild in dev mode:

- After changing `package.json` (add/remove dependencies) — run `down -v` then `up` to reinstall
- Never needed for source code changes (`.js`, `.tsx`, `.ts` files)

### Production Mode (`docker-compose.yml`)

Builds Docker images using each service's `Dockerfile`. The frontend Dockerfile uses the **monorepo root as build context** (not `./frontend`) because it depends on the `@nutrishop/ui` workspace package. Backend runs `node` directly.

```bash
# Build and start
docker-compose up --build

# Start without rebuilding (uses cached images)
docker-compose up

# Start in background
docker-compose up -d

# Rebuild a single service
docker-compose build frontend && docker-compose up frontend

# Stop
docker-compose down

# Stop and delete all data
docker-compose down -v
```

When to rebuild in production mode:

- After any source code change
- After changing `package.json`
- After changing environment variables prefixed with `NEXT_PUBLIC_*` (inlined at build time)

## Common Commands

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f              # all services
docker-compose -f docker-compose.dev.yml logs -f backend      # backend only

# Open a shell in a running container
docker-compose -f docker-compose.dev.yml exec backend sh
docker-compose -f docker-compose.dev.yml exec frontend sh

# Run a one-off command
docker-compose -f docker-compose.dev.yml exec postgres psql -U admin appdb
```

---

## Environment Configuration

All configuration lives in the `.env` file at the project root.

### Required Variables

```env
# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=appdb
DATABASE_URL=postgresql://admin:password@postgres:5432/appdb

# JWT (change these in production!)
JWT_SECRET=change-me-to-a-random-64-char-string-in-production
JWT_REFRESH_SECRET=change-me-to-another-random-64-char-string

# URLs
FRONTEND_URL=http://localhost:3000
```

### Google OAuth (Optional)

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

To obtain these:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create or select a project
3. Go to **APIs & Services > Credentials**
4. Click **+ CREATE CREDENTIALS > OAuth client ID**
5. Configure the OAuth consent screen if prompted
6. Application type: **Web application**
7. Add authorized redirect URI: `http://localhost:4000/api/auth/google/callback`
8. Copy the Client ID and Client Secret into `.env`

If Google OAuth is not configured, the app works fine with local auth only — the Google button simply won't appear on the login page.

---

## Production Considerations

### Security Checklist

- [ ] Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to random 64+ character strings
- [ ] Change `POSTGRES_PASSWORD` to a strong password
- [ ] Set `NODE_ENV=production` on the backend (enables `secure` flag on cookies)
- [ ] Use HTTPS (required for `secure` cookies)
- [ ] Update `FRONTEND_URL` to your production domain
- [ ] Update `GOOGLE_CALLBACK_URL` to your production callback URL
- [ ] Add your production domain to Google OAuth authorized origins and redirect URIs
- [ ] Consider rate limiting on auth endpoints to prevent brute-force attacks
- [ ] Set up log aggregation for auth errors
- [ ] Ensure all CI checks pass before merging (lint, tests, build)

### Generate Secure Secrets

```bash
# Generate a random 64-character hex string
openssl rand -hex 32
```

### Database Backups

The PostgreSQL data is stored in a Docker named volume (`postgres_data`). To back up:

```bash
# Dump the database
docker-compose exec postgres pg_dump -U admin appdb > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U admin appdb < backup.sql
```

---

## Troubleshooting

### "CORS error" in browser console

The frontend is trying to reach the backend but CORS is blocking it. Check that `FRONTEND_URL` in `.env` matches the URL you're accessing the frontend from.

### "Token expired" loops

If you keep getting redirected to login, the access token is expiring and refresh is failing. Check:

- Is the backend running? (`docker-compose logs backend`)
- Is the `refresh_token` cookie being sent? (Browser DevTools > Application > Cookies)

### Google OAuth "redirect_uri_mismatch"

The callback URL in your Google Cloud Console doesn't match `GOOGLE_CALLBACK_URL`. They must be identical, including protocol and port.

### Frontend build fails with "useSearchParams must be wrapped in Suspense"

This is a Next.js 14 requirement. The login page wraps its form in `<Suspense>` to handle this. If you add new pages using `useSearchParams`, wrap them too.

### Database connection refused

PostgreSQL isn't ready yet. The healthcheck and `depends_on` should handle this, but if it persists:

```bash
docker-compose down -v   # remove old volume
docker-compose up --build
```
