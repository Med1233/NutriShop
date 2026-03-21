# Frontend Documentation

## Technology

- **Next.js 14** with App Router
- **React 18** with client components (`'use client'`)
- **TypeScript**
- **Inline styles** (no CSS framework)
- **Standalone output** for Docker deployment

---

## Layout and Provider Hierarchy

`frontend/src/app/layout.tsx` is the root layout that wraps every page:

```
<html lang="en">
  <body>
    <LanguageProvider>        ← i18n context (outermost — no auth dependency)
      <AuthProvider>          ← auth state (depends on language for error messages)
        <CartProvider>        ← cart state (depends on auth — needs user)
          <Navbar />          ← always visible (shows cart badge)
          {children}          ← page content
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </body>
</html>
```

**Why this order?**

- `LanguageProvider` is outermost because it has no dependencies
- `AuthProvider` is inside because it may display translated error messages
- `CartProvider` is innermost because it needs the current user from `AuthProvider`
- `Navbar` is in the layout so it appears on all pages without repetition

---

## Pages

### Home Page — `frontend/src/app/page.tsx`

**Route:** `/`
**Protection:** Public (anyone can browse products)

**Sections:**

1. Hero banner with branding ("Fuel Your Performance")
2. Search bar for filtering products by name/description
3. Category filter buttons (All, Proteins, Vitamins, Supplements, Superfoods, Snacks)
4. Product grid with SVG product images, category badge, description, price, and "Add to Cart" button

**Behavior:**

- Fetches products from `GET /api/products` with optional `?category=` and `?search=` query params
- Fetches categories from `GET /api/products/categories` on mount
- "Add to Cart" button shown for all users (guest cart uses localStorage)
- Shows "Added!" feedback for 1.5s after adding to cart

---

### Product Detail — `frontend/src/app/products/[id]/page.tsx`

**Route:** `/products/:id`
**Protection:** Public

**Features:**

- Large SVG product image (category-themed)
- Full product info with category badge and stock count
- Quantity selector (1-10, capped at stock)
- "Add to Cart" button (available to all users)
- Nutrition facts panel from the product's `nutrition_info` JSONB field
- Back button for navigation

---

### Cart — `frontend/src/app/cart/page.tsx`

**Route:** `/cart`
**Protection:** None (works for both guests and authenticated users)

**Features:**

- Lists cart items with product thumbnail images and links to product detail pages
- Quantity selector per item (updates via `PUT /api/cart/:id`)
- Remove button per item (via `DELETE /api/cart/:id`)
- Line totals and subtotal
- "Proceed to Checkout" button linking to `/checkout`
- Empty cart message with "Continue Shopping" link

---

### Checkout — `frontend/src/app/checkout/page.tsx`

**Route:** `/checkout`
**Protection:** Requires authentication (redirects to login)

**Features:**

- Order summary showing all cart items and total
- Shipping address textarea (required)
- "Place Order" button → `POST /api/orders`
- Success state showing order ID and link to profile page
- Error display for stock issues or server errors

---

### Profile — `frontend/src/app/profile/page.tsx`

**Route:** `/profile`
**Protection:** Requires authentication (redirects to login)

**Two tabs:**

**Profile tab:**

- Header with avatar, name, email
- Stats: total orders, total spent
- Account details: name, email, auth method, role
- Quick links: browse products, view cart

**Orders tab:**

- Lists all orders with status badges (color-coded: pending, processing, shipped, delivered)
- Order date and total
- Expandable detail view (click "View Details"):
  - Shipping address
  - Individual order items with quantities and prices
  - Links to product detail pages

**Data fetching:**

- Fetches orders from `GET /api/orders`
- User data comes from `AuthContext`

---

### Login Page — `frontend/src/app/login/page.tsx`

**Route:** `/login`

**Features:**

- Email/password form
- "Continue with Google" button (only shown if `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is configured)
- Error display (from form validation, API errors, or OAuth errors via `?error=` query param)
- Link to registration page
- All text is translated via `t()`

---

### Register Page — `frontend/src/app/register/page.tsx`

**Route:** `/register`

**Features:**

- Name, email, password, confirm password fields
- Client-side validation: passwords must match
- Server-side validation: email uniqueness, password length
- On success, automatically logs in and redirects to `/`
- Link to login page

---

## Components

### ProductImage — `frontend/src/app/components/ProductImage.tsx`

Renders category-themed SVG product images. Each category has a unique color and icon illustration:

| Category    | Color     | Icon              |
| ----------- | --------- | ----------------- |
| proteins    | `#2563eb` | Protein container |
| vitamins    | `#f59e0b` | Vitamin capsule   |
| supplements | `#8b5cf6` | Pill capsules     |
| superfoods  | `#16a34a` | Leaf shape        |
| snacks      | `#ef4444` | Energy bar        |

**Props:**

- `category` (string) — determines color and icon
- `name` (string) — shown as overlay text
- `size` — `'small'` (60x60, for cart), `'medium'` (full width x 160, for catalog cards), `'large'` (full width x 320, for product detail)

Used in: homepage product grid, product detail page, cart items.

---

### Navbar — `frontend/src/app/components/Navbar.tsx`

Always visible. Shows different content based on auth state:

**Logged out:**

```
[NutriShop]                         [🌐 Language ▼] [Sign In] [Register]
```

**Logged in (customer):**

```
[NutriShop]      [🌐 Language ▼] [Cart (3)] [My Profile] [Hi, Name] [Sign Out]
```

**Logged in (admin):**

```
[NutriShop]      [🌐 Language ▼] [Cart (3)] [My Profile] [Admin] [Hi, Name] [Sign Out]
```

The cart badge shows the total number of items in the cart. Green (#16a34a) is the primary brand color.

### LanguageSelector — `frontend/src/app/components/LanguageSelector.tsx`

A `<select>` dropdown that changes the app language. Appears in the Navbar. See [i18n documentation](./03-internationalization.md) for details.

---

## Contexts

### Auth Context — `frontend/src/app/context/AuthContext.tsx`

See [Authentication documentation](./02-authentication.md#frontend-auth-context) for full details.

**Key design decisions:**

- All API calls use `credentials: 'include'` to send cookies
- API calls target `http://localhost:4000` directly (not through the Next.js rewrite)
- On initial load, tries `GET /me` → if 401, tries `POST /refresh` → if that fails, user is null

### Cart Context — `frontend/src/app/context/CartContext.tsx`

See [E-Commerce documentation](./07-ecommerce.md#cart-context) for full details.

**Key design decisions:**

- **Authenticated**: syncs with backend `/api/cart` endpoints
- **Guest**: stores cart in `localStorage`, fetches product details from `/api/products`
- **On login**: merges guest cart into backend cart, clears localStorage
- Exposes `addToCart`, `updateQuantity`, `removeItem`, `refresh` methods
- Provides `itemCount` for the navbar badge

---

## Next.js Configuration

### `next.config.js`

```javascript
const nextConfig = {
  output: 'standalone', // Produces a minimal self-contained build for Docker
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      },
    ];
  },
};
```

The rewrite rule is defined for general API proxying, but auth-related requests bypass it by calling the backend directly.

### `Dockerfile`

Multi-stage build:

1. **Builder stage** — installs deps, copies source, runs `npm run build`
   - Receives `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_BACKEND_URL` as build args (because `NEXT_PUBLIC_*` vars are inlined at build time)
2. **Runner stage** — copies only the standalone output + static files
   - Minimal image, production-only

---

## Styling Approach

All styles use inline React `style` objects — no CSS files, no Tailwind, no CSS modules.

**Brand color:** Green `#16a34a` used for buttons, links, borders, and accents.

**Pattern used throughout:**

```typescript
const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', ... },
  card: { maxWidth: 400, ... },
};

// Usage:
<div style={styles.container}>
```

**RTL compatibility:** Flexbox layouts automatically reverse when `dir="rtl"` is set on the document.
