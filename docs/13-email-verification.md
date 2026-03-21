# Email Verification

## Overview

New users registering with email/password must verify their email address before placing orders. Google OAuth users are automatically verified since Google already confirmed their email.

## Flow

```
Register (local) → email_verified: false → Verification email sent
    ↓
User clicks link in email → GET /verify-email?token=xxx
    ↓
Frontend calls POST /api/auth/verify-email → email_verified: true
    ↓
JWT refreshed → full access
```

## Restrictions

| Feature                       | Unverified | Verified |
| ----------------------------- | ---------- | -------- |
| Browse products               | Yes        | Yes      |
| Add to cart                   | Yes        | Yes      |
| Edit profile                  | Yes        | Yes      |
| View orders                   | Yes        | Yes      |
| Use chatbot                   | Yes        | Yes      |
| **Place an order (checkout)** | **No**     | Yes      |

Only order creation (`POST /api/orders`) requires email verification.

## Backend

### Database

**Column on `users` table:**

```sql
email_verified BOOLEAN NOT NULL DEFAULT false
```

**New table `verification_tokens`:**

```sql
CREATE TABLE verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Auth helpers (`backend/src/auth.js`)

| Function                            | Purpose                                                    |
| ----------------------------------- | ---------------------------------------------------------- |
| `generateVerificationToken(userId)` | Creates a random 64-char hex token, stores with 24h expiry |
| `findVerificationToken(token)`      | Looks up unexpired token                                   |
| `deleteVerificationTokens(userId)`  | Cleans up all tokens for a user                            |

### Middleware (`backend/src/middleware.js`)

`requireVerified` — returns 403 with `code: 'EMAIL_NOT_VERIFIED'` if `req.user.email_verified` is false. Applied only to `POST /api/orders`.

### Endpoints

| Method | Path                            | Auth | Purpose                                |
| ------ | ------------------------------- | ---- | -------------------------------------- |
| POST   | `/api/auth/verify-email`        | No   | Validate token, mark email as verified |
| POST   | `/api/auth/resend-verification` | Yes  | Generate new token, resend email       |

Both are rate limited (10 requests per 15 minutes).

### Email sending (`backend/src/email.js`)

Uses **Resend** (HTTPS API) — not SMTP, since DigitalOcean blocks SMTP ports.

```
Resend API (HTTPS) → noreply@nutrishop.store → user's inbox
```

If `RESEND_API_KEY` is not set, falls back to logging the verification URL to console (development mode).

### Auto-verification rules

- **Google OAuth users** — `email_verified` set to `true` on creation
- **Existing users** — grandfathered as verified (migration sets `true` for users created before the feature)
- **Admin seed user** — created with `email_verified: true`

## Frontend

### VerificationBanner (`frontend/src/app/components/VerificationBanner.tsx`)

Amber alert bar shown at the top of all pages for unverified local users. Includes a "Resend verification email" button with loading/success/error states.

Not shown for:

- Guests (not logged in)
- Google OAuth users
- Already verified users

### Verify Email page (`frontend/src/app/verify-email/page.tsx`)

Handles the verification link from the email (`/verify-email?token=xxx`):

1. Reads token from URL
2. Calls `POST /api/auth/verify-email`
3. Shows success or error
4. On success, refreshes the JWT via `refresh()` to update `email_verified` in the auth context

### AuthContext changes

- `user.email_verified` included in all auth responses (login, register, refresh, me)
- `email_verified` included in JWT payload
- `resendVerification()` function added to context

## Configuration

| Variable         | Purpose                                                      |
| ---------------- | ------------------------------------------------------------ |
| `RESEND_API_KEY` | Resend API key (from https://resend.com)                     |
| `EMAIL_FROM`     | Sender address (e.g., `NutriShop <noreply@nutrishop.store>`) |

### DNS records for Resend (on domain registrar)

| Type | Name                | Value                                                 |
| ---- | ------------------- | ----------------------------------------------------- |
| TXT  | `resend._domainkey` | DKIM public key                                       |
| MX   | `send`              | `feedback-smtp.eu-west-1.amazonses.com` (priority 10) |
| TXT  | `send`              | `v=spf1 include:amazonses.com ~all`                   |

## i18n

Translation keys for EN, FR, AR:

- `verification.banner` — banner message
- `verification.resend` — resend button
- `verification.resendSuccess` / `verification.resendError` — feedback
- `verification.pageTitle` — verify page heading
- `verification.success` / `verification.failed` — verify page result
- `verification.required` — feature restriction message
