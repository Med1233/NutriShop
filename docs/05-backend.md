# Backend Documentation

## Technology

- **Express.js 4** on Node.js 20
- **PostgreSQL 16** via the `pg` library (connection pooling)
- **bcrypt** for password hashing
- **jsonwebtoken** for JWT creation/verification
- **cookie-parser** for reading cookies from requests
- **cors** for cross-origin request handling
- **helmet** for security headers (CSP, X-Frame-Options, HSTS, etc.)
- **express-rate-limit** for brute force protection on auth endpoints
- **uuid** for generating refresh tokens

---

## Entry Point — `backend/src/index.js`

Initializes the Express app with middleware and routes:

```
1. Load .env variables
2. Enable Helmet security headers
3. Configure CORS (allow frontend origin with credentials)
4. Enable JSON body parsing
5. Enable cookie parsing
6. CSRF token endpoint (GET /api/auth/csrf-token)
7. CSRF protection middleware (double-submit cookie on /cart, /orders, /admin)
8. Mount auth routes at /api/auth (with rate limiting)
9. Define public routes (GET /api/health)
10. Mount product routes at /api/products (public)
11. Mount cart routes at /api/cart (auth + CSRF required)
12. Mount order routes at /api/orders (auth + CSRF required)
13. Mount admin routes at /api/admin (admin + CSRF required)
14. Start server on port 4000
15. Initialize database (create tables, seed products, seed admin from env)
```

### CORS Configuration

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);
```

- `origin` — only allows requests from the frontend (not `*`)
- `credentials: true` — allows cookies to be sent cross-origin

This is necessary because the frontend (port 3000) makes direct API calls to the backend (port 4000).

---

## Database — `backend/src/db.js`

### Connection Pool

Uses `pg.Pool` with the `DATABASE_URL` connection string. The pool manages multiple connections automatically.

### Schema Initialization (`initDb`)

Called once on server startup. Creates six tables if they don't exist:

1. **`users`** — authentication accounts
2. **`refresh_tokens`** — active sessions
3. **`products`** — nutrition product catalog
4. **`cart_items`** — shopping cart (per user)
5. **`orders`** — completed orders
6. **`order_items`** — line items within each order

Also drops the legacy `items` table if it exists, and seeds the `products` table with 12 nutrition products if empty.

See [E-Commerce docs](./07-ecommerce.md#database-schema) for full product/cart/order schemas.
See [Authentication docs](./02-authentication.md#database-schema) for user/refresh_token schemas.

---

## Auth Module — `backend/src/auth.js`

Pure utility functions with no Express dependency. See [Authentication docs](./02-authentication.md) for full details.

| Function               | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `hashPassword`         | bcrypt hash with 12 salt rounds          |
| `verifyPassword`       | bcrypt compare                           |
| `generateAccessToken`  | Sign JWT with user payload               |
| `verifyAccessToken`    | Verify + decode JWT                      |
| `generateRefreshToken` | Create UUID, store in DB                 |
| `findRefreshToken`     | Look up by token string, check expiry    |
| `revokeRefreshToken`   | Delete single token                      |
| `revokeAllUserTokens`  | Delete all tokens for a user             |
| `setTokenCookies`      | Set access + refresh cookies on response |
| `clearTokenCookies`    | Clear both cookies                       |

---

## Middleware — `backend/src/middleware.js`

### `requireAuth`

Protects endpoints that need authentication:

```
Request → Read access_token cookie → Verify JWT → Attach req.user → next()
                                        ↓ (fail)
                                   Return 401
```

### `optionalAuth`

Same flow, but continues even without a valid token. `req.user` will be `undefined` for anonymous requests.

### `requireAdmin`

Must be used after `requireAuth`. Checks that `req.user.role === 'admin'`. Returns 403 if not.

---

## API Endpoints

### Public Endpoints

| Method | Path                       | Description                              |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/api/health`              | Returns `{ status: 'ok' }`               |
| GET    | `/api/products`            | List products (`?category=`, `?search=`) |
| GET    | `/api/products/categories` | List distinct product categories         |
| GET    | `/api/products/:id`        | Get single product detail                |
| POST   | `/api/products`            | Create product (admin only)              |
| PUT    | `/api/products/:id`        | Update product (admin only)              |
| DELETE | `/api/products/:id`        | Delete product (admin only)              |

### Auth Endpoints (mounted at `/api/auth`)

| Method | Path                        | Description                  | Auth Required            | Rate Limited |
| ------ | --------------------------- | ---------------------------- | ------------------------ | ------------ |
| POST   | `/api/auth/register`        | Create local account         | No                       | Yes          |
| POST   | `/api/auth/login`           | Login with email/password    | No                       | Yes          |
| POST   | `/api/auth/refresh`         | Refresh access token         | No (uses refresh cookie) | Yes          |
| POST   | `/api/auth/logout`          | Logout current session       | No                       | No           |
| POST   | `/api/auth/logout-all`      | Revoke all sessions          | Yes                      | No           |
| GET    | `/api/auth/me`              | Get current user profile     | Yes                      | No           |
| PUT    | `/api/auth/profile`         | Update profile               | Yes                      | No           |
| GET    | `/api/auth/csrf-token`      | Get CSRF token (sets cookie) | No                       | No           |
| GET    | `/api/auth/google`          | Start Google OAuth flow      | No                       | No           |
| GET    | `/api/auth/google/callback` | Google OAuth callback        | No                       | No           |

See [Authentication docs](./02-authentication.md) for detailed request/response formats.

### Cart Endpoints (mounted at `/api/cart`)

| Method | Path            | Description                   | Auth Required |
| ------ | --------------- | ----------------------------- | ------------- |
| GET    | `/api/cart`     | Get cart with product details | Yes           |
| POST   | `/api/cart`     | Add product to cart           | Yes           |
| PUT    | `/api/cart/:id` | Update cart item quantity     | Yes           |
| DELETE | `/api/cart/:id` | Remove item from cart         | Yes           |

### Order Endpoints (mounted at `/api/orders`)

| Method | Path                     | Description                            | Auth Required |
| ------ | ------------------------ | -------------------------------------- | ------------- |
| POST   | `/api/orders`            | Create order from cart (transactional) | Yes           |
| GET    | `/api/orders`            | List user's orders                     | Yes           |
| GET    | `/api/orders/:id`        | Get order detail with items            | Yes           |
| PUT    | `/api/orders/:id/status` | Update order status                    | Admin         |

### Admin Endpoints (mounted at `/api/admin`)

| Method | Path                        | Description                                        | Auth Required |
| ------ | --------------------------- | -------------------------------------------------- | ------------- |
| GET    | `/api/admin/users`          | List all users                                     | Admin         |
| PUT    | `/api/admin/users/:id/role` | Change user role                                   | Admin         |
| DELETE | `/api/admin/users/:id`      | Delete a user                                      | Admin         |
| GET    | `/api/admin/stats`          | Dashboard stats (users, products, orders, revenue) | Admin         |

See [E-Commerce docs](./07-ecommerce.md) for full details on the order flow.

---

## Route Files

| File                 | Mount Point     | Auth     | Description                                             |
| -------------------- | --------------- | -------- | ------------------------------------------------------- |
| `routes/auth.js`     | `/api/auth`     | Mixed    | Authentication endpoints                                |
| `routes/products.js` | `/api/products` | Public   | Product catalog CRUD                                    |
| `routes/cart.js`     | `/api/cart`     | Required | Shopping cart management                                |
| `routes/orders.js`   | `/api/orders`   | Required | Order creation/history; admin: list all + update status |
| `routes/admin.js`    | `/api/admin`    | Admin    | User management + dashboard stats                       |

---

## Dependencies

| Package              | Version | Purpose                                |
| -------------------- | ------- | -------------------------------------- |
| `express`            | ^4.19   | HTTP framework                         |
| `pg`                 | ^8.12   | PostgreSQL client with connection pool |
| `bcryptjs`           | ^2.4    | Password hashing                       |
| `jsonwebtoken`       | ^9.0    | JWT sign/verify                        |
| `cookie-parser`      | ^1.4    | Parse Cookie header into req.cookies   |
| `cors`               | ^2.8    | CORS headers                           |
| `helmet`             | ^8.0    | Security headers                       |
| `express-rate-limit` | ^8.0    | Rate limiting on auth endpoints        |
| `dotenv`             | ^16.4   | Load .env file                         |
| `uuid`               | ^9.0    | Generate v4 UUIDs for refresh tokens   |

### Dev Dependencies

| Package   | Version | Purpose                                          |
| --------- | ------- | ------------------------------------------------ |
| `nodemon` | ^3.1    | Auto-restarts backend on file changes (dev mode) |

---

## npm Scripts

| Script  | Command                | Used in                                |
| ------- | ---------------------- | -------------------------------------- |
| `start` | `node src/index.js`    | Production (`docker-compose.yml`)      |
| `dev`   | `nodemon src/index.js` | Development (`docker-compose.dev.yml`) |

---

## Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY src ./src
EXPOSE 4000
CMD ["node", "src/index.js"]
```

Single-stage build. Uses Alpine Linux for a small image. Copies `package.json` first for Docker layer caching — dependencies are only reinstalled when `package.json` changes.
