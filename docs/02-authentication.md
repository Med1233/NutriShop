# Authentication System

## Overview

The app supports two authentication methods:

1. **Local authentication** — email/password registration and login
2. **Delegated authentication** — Google OAuth 2.0

Both methods produce the same result: a pair of HttpOnly cookies (access token + refresh token) that authenticate all subsequent API requests.

---

## Backend Files

### `backend/src/auth.js` — Core Auth Utilities

This module provides all the cryptographic and token management primitives used by the auth routes.

#### Password Hashing

```
hashPassword(password) → bcrypt hash (12 salt rounds)
verifyPassword(password, hash) → boolean
```

- Uses **bcrypt** with 12 salt rounds
- Salt rounds determine computational cost — 12 is strong enough to resist brute-force while keeping login under ~250ms
- Each password gets a unique random salt embedded in the hash

#### Access Token (JWT)

```
generateAccessToken(user) → signed JWT string
verifyAccessToken(token) → decoded payload or throws
```

- **Format**: JSON Web Token signed with `JWT_SECRET` (HMAC-SHA256)
- **Payload**: `{ id, email, name }`
- **Lifetime**: 15 minutes
- Short lifetime limits damage if a token is stolen

#### Refresh Token

```
generateRefreshToken(userId) → { token: UUID, expiresAt: Date }
findRefreshToken(token) → row or null (checks expiry)
revokeRefreshToken(token) → deletes from DB
revokeAllUserTokens(userId) → deletes all user's tokens
```

- **Format**: Random UUID (not a JWT — no sensitive data encoded)
- **Storage**: `refresh_tokens` table in PostgreSQL
- **Lifetime**: 7 days
- **Rotation**: Each time a refresh token is used, the old one is deleted and a new one is created. This means a stolen refresh token can only be used once.

#### Cookie Helpers

```
setTokenCookies(res, accessToken, refreshToken, refreshExpiresAt)
clearTokenCookies(res)
```

Sets two separate cookies:

| Cookie          | Path        | MaxAge | Purpose                     |
| --------------- | ----------- | ------ | --------------------------- |
| `access_token`  | `/`         | 15 min | Sent on every API request   |
| `refresh_token` | `/api/auth` | 7 days | Only sent to auth endpoints |

Both cookies use these security settings:

| Setting    | Value          | Why                                                                           |
| ---------- | -------------- | ----------------------------------------------------------------------------- |
| `httpOnly` | `true`         | JavaScript cannot read the cookie (XSS protection)                            |
| `sameSite` | `lax`          | Sent on same-site requests + top-level navigation (needed for OAuth redirect) |
| `secure`   | `true` in prod | Only sent over HTTPS in production                                            |

---

### `backend/src/middleware.js` — Auth Middleware

#### `requireAuth(req, res, next)`

Protects routes that require authentication:

1. Reads `access_token` from cookies
2. Verifies the JWT signature and expiry
3. Attaches decoded user to `req.user`
4. Returns `401` if missing, expired, or invalid

If the token is expired, returns `{ error: 'Token expired', code: 'TOKEN_EXPIRED' }` so the frontend knows to try a refresh.

#### `optionalAuth(req, res, next)`

Same as `requireAuth`, but doesn't block if no token is present. Attaches `req.user` if valid, otherwise continues without it. Useful for routes that behave differently for authenticated vs. anonymous users.

---

### `backend/src/routes/auth.js` — Auth Endpoints

#### `POST /api/auth/register`

Creates a new local account.

**Request body:**

```json
{ "email": "user@example.com", "password": "min8chars", "name": "John" }
```

**Flow:**

1. Validates all fields are present and password ≥ 8 characters
2. Checks if email already exists → `409 Conflict` if so
3. Hashes password with bcrypt
4. Inserts user into `users` table with `provider: 'local'`
5. Generates access + refresh tokens
6. Sets HttpOnly cookies
7. Returns user profile

**Response:** `201 Created`

```json
{ "user": { "id": 1, "email": "...", "name": "...", "provider": "local" } }
```

---

#### `POST /api/auth/login`

Authenticates with email and password.

**Request body:**

```json
{ "email": "user@example.com", "password": "min8chars" }
```

**Flow:**

1. Looks up user by email
2. If user's provider is not `local`, returns error suggesting the correct method (e.g., "This account uses google sign-in")
3. Compares password with stored bcrypt hash
4. Generates access + refresh tokens
5. Sets HttpOnly cookies

**Response:** `200 OK`

```json
{ "user": { "id": 1, "email": "...", "name": "...", "provider": "local" } }
```

**Error responses:**

- `401` — Invalid email or password (same message for both to prevent email enumeration)
- `401` — Account uses different provider

---

#### `POST /api/auth/refresh`

Exchanges an expired access token for a new one using the refresh token.

**Flow:**

1. Reads `refresh_token` from cookies (only sent to `/api/auth` path)
2. Looks up token in DB — must exist and not be expired
3. **Rotates**: deletes old token, creates new one
4. Generates new access token
5. Sets new cookies

**Why rotation matters:** If an attacker steals a refresh token and uses it, the real user's next refresh attempt will fail (token already revoked), alerting them to the breach. Without rotation, a stolen token could be used indefinitely for 7 days.

---

#### `POST /api/auth/logout`

Logs out the current session.

**Flow:**

1. Reads refresh token from cookies
2. Deletes it from DB
3. Clears both cookies

---

#### `POST /api/auth/logout-all`

Revokes all sessions for the current user (requires authentication).

**Flow:**

1. Authenticated via `requireAuth` middleware
2. Deletes ALL refresh tokens for this user from DB
3. Clears cookies

Use case: user suspects their account is compromised and wants to force logout everywhere.

---

#### `GET /api/auth/me`

Returns the current user's profile. Protected by `requireAuth`.

**Response:** `200 OK`

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John",
    "provider": "local",
    "created_at": "2026-03-17T..."
  }
}
```

---

#### `GET /api/auth/google`

Initiates the Google OAuth 2.0 flow.

**Flow:**

1. Builds the Google authorization URL with:
   - `client_id` — identifies our app to Google
   - `redirect_uri` — where Google sends the user back
   - `scope: openid email profile` — what data we request
   - `access_type: offline` — requests a refresh token from Google
   - `prompt: consent` — always show the consent screen
2. Redirects the browser to Google's consent page

If Google OAuth is not configured, returns `501 Not Implemented`.

---

#### `GET /api/auth/google/callback`

Handles the redirect back from Google after the user consents.

**Flow:**

1. Receives `?code=...` query parameter from Google
2. **Exchanges the code for tokens** — POST to `https://oauth2.googleapis.com/token` with the code + client secret. Returns a Google access token.
3. **Fetches user profile** — GET `https://www.googleapis.com/oauth2/v2/userinfo` using the Google access token. Returns email, name, Google ID.
4. **Finds or creates user:**
   - If email exists with `provider: 'local'` → links account by updating provider to `google`
   - If email exists with `provider: 'google'` → uses existing account
   - If email doesn't exist → creates new user with `provider: 'google'`
5. Generates access + refresh tokens
6. Sets HttpOnly cookies
7. Redirects browser to `FRONTEND_URL` (http://localhost:3000)

**Error handling:** All errors redirect to `/login?error=<reason>` instead of showing JSON, since this is a browser redirect flow.

---

## Database Schema

### `users` table

| Column          | Type      | Notes                           |
| --------------- | --------- | ------------------------------- |
| `id`            | SERIAL PK | Auto-incrementing               |
| `email`         | TEXT      | UNIQUE, NOT NULL                |
| `password_hash` | TEXT      | NULL for OAuth users            |
| `name`          | TEXT      | NOT NULL                        |
| `provider`      | TEXT      | `'local'` or `'google'`         |
| `provider_id`   | TEXT      | Google user ID (NULL for local) |
| `created_at`    | TIMESTAMP | Default NOW()                   |
| `updated_at`    | TIMESTAMP | Default NOW()                   |

### `refresh_tokens` table

| Column       | Type      | Notes                            |
| ------------ | --------- | -------------------------------- |
| `id`         | SERIAL PK | Auto-incrementing                |
| `user_id`    | INTEGER   | FK → users(id) ON DELETE CASCADE |
| `token`      | TEXT      | UNIQUE, UUID v4                  |
| `expires_at` | TIMESTAMP | 7 days from creation             |
| `created_at` | TIMESTAMP | Default NOW()                    |

The `ON DELETE CASCADE` ensures that deleting a user automatically cleans up their refresh tokens.

---

## Frontend Auth Context

### `frontend/src/app/context/AuthContext.tsx`

A React context that manages client-side authentication state.

#### State

- `user` — current user object or `null`
- `loading` — `true` while checking initial auth status

#### Methods

| Method                            | Purpose                                              |
| --------------------------------- | ---------------------------------------------------- |
| `login(email, password)`          | POST to `/api/auth/login`, sets `user` on success    |
| `register(email, password, name)` | POST to `/api/auth/register`, sets `user` on success |
| `logout()`                        | POST to `/api/auth/logout`, clears `user`            |
| `refresh()`                       | POST to `/api/auth/refresh`, updates `user`          |

#### Initialization Flow

When the app loads:

1. `fetchUser()` calls `GET /api/auth/me`
2. If `200 OK` → user is authenticated, set state
3. If `401` → tries `refresh()` to get a new access token
4. If refresh fails → user is `null`, redirect to login

#### Auto-Refresh

When any API call returns `401 TOKEN_EXPIRED`, the context automatically tries to refresh the access token before marking the user as logged out. This provides seamless session extension — users stay logged in for up to 7 days without re-entering credentials.

---

## Security Summary

| Threat                 | Protection                                                           |
| ---------------------- | -------------------------------------------------------------------- |
| Password theft         | bcrypt hashing (12 rounds) — passwords never stored in plain text    |
| XSS token theft        | HttpOnly cookies — JavaScript cannot access tokens                   |
| CSRF                   | SameSite=Lax cookies — not sent on cross-site POST requests          |
| Token replay           | Refresh token rotation — each token is single-use                    |
| Session hijacking      | Short-lived access tokens (15 min) + logout-all to revoke everything |
| Email enumeration      | Same error message for "wrong email" and "wrong password"            |
| OAuth account takeover | Account linking only when same email is verified by Google           |
