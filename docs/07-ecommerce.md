# E-Commerce — Nutrition Products Store

## Overview

NutriShop is a nutrition-focused e-commerce store selling proteins, vitamins, supplements, superfoods, and snacks. The store supports product browsing (public), cart management, checkout, and order history (authenticated users).

---

## Database Schema

### `products` table

| Column         | Type          | Description                          |
|----------------|---------------|--------------------------------------|
| `id`           | SERIAL PK     | Auto-incrementing ID                 |
| `name`         | TEXT NOT NULL  | Product name                         |
| `description`  | TEXT          | Product description                  |
| `price`        | NUMERIC(10,2) | Price in USD                         |
| `image_url`    | TEXT          | Product image path                   |
| `category`     | TEXT NOT NULL  | One of: proteins, vitamins, supplements, superfoods, snacks |
| `stock`        | INTEGER       | Available quantity (defaults to 0)   |
| `nutrition_info`| JSONB        | Nutrition facts (calories, protein, etc.) |
| `created_at`   | TIMESTAMP     | Creation timestamp                   |

### `cart_items` table

| Column       | Type        | Description                         |
|--------------|-------------|-------------------------------------|
| `id`         | SERIAL PK   | Auto-incrementing ID                |
| `user_id`    | INTEGER FK  | References users(id), CASCADE delete|
| `product_id` | INTEGER FK  | References products(id), CASCADE delete |
| `quantity`    | INTEGER     | Number of items (default 1)         |
| `created_at` | TIMESTAMP   | Creation timestamp                  |

**Unique constraint:** `(user_id, product_id)` — one cart entry per product per user; adding duplicates increments quantity.

### `orders` table

| Column            | Type          | Description                     |
|-------------------|---------------|---------------------------------|
| `id`              | SERIAL PK     | Auto-incrementing ID            |
| `user_id`         | INTEGER FK    | References users(id)            |
| `total`           | NUMERIC(10,2) | Order total at time of purchase |
| `status`          | TEXT          | pending, processing, shipped, delivered |
| `shipping_address`| TEXT          | Customer shipping address       |
| `created_at`      | TIMESTAMP     | Order creation timestamp        |

### `order_items` table

| Column       | Type          | Description                      |
|--------------|---------------|----------------------------------|
| `id`         | SERIAL PK     | Auto-incrementing ID             |
| `order_id`   | INTEGER FK    | References orders(id)            |
| `product_id` | INTEGER FK    | References products(id)          |
| `quantity`    | INTEGER       | Quantity purchased               |
| `price`      | NUMERIC(10,2) | Price at time of purchase        |

---

## API Endpoints

### Products (Public — no auth required)

| Method | Path                    | Description                              |
|--------|-------------------------|------------------------------------------|
| GET    | `/api/products`         | List products. Query: `?category=`, `?search=` |
| GET    | `/api/products/categories` | List distinct categories              |
| GET    | `/api/products/:id`     | Get single product detail                |

### Cart (Auth required)

| Method | Path             | Description                              |
|--------|------------------|------------------------------------------|
| GET    | `/api/cart`      | Get cart with product details            |
| POST   | `/api/cart`      | Add product to cart (body: `{product_id, quantity}`) |
| PUT    | `/api/cart/:id`  | Update cart item quantity (body: `{quantity}`) |
| DELETE | `/api/cart/:id`  | Remove item from cart                    |

### Orders (Auth required)

| Method | Path               | Description                              |
|--------|--------------------|------------------------------------------|
| POST   | `/api/orders`      | Create order from cart (body: `{shipping_address}`) |
| GET    | `/api/orders`      | List user's orders                       |
| GET    | `/api/orders/:id`  | Get order detail with items              |

---

## Order Flow

1. User browses products on the homepage (public, no login required)
2. User adds products to cart (works for both guests and logged-in users)
3. User navigates to cart, adjusts quantities
4. User proceeds to checkout, enters shipping address
5. Backend creates order in a **transaction**:
   - Validates all cart items have sufficient stock
   - Creates `orders` row with calculated total
   - Creates `order_items` rows for each cart item
   - Decrements product stock
   - Clears the user's cart
6. User sees confirmation with order ID
7. User can view order history and details

---

## Product Categories

| Category      | Translation Key          | Color     |
|---------------|--------------------------|-----------|
| `proteins`    | `categories.proteins`    | `#2563eb` |
| `vitamins`    | `categories.vitamins`    | `#f59e0b` |
| `supplements` | `categories.supplements` | `#8b5cf6` |
| `superfoods`  | `categories.superfoods`  | `#16a34a` |
| `snacks`      | `categories.snacks`      | `#ef4444` |

---

## Seed Data

The database is seeded with 12 nutrition products on first initialization:

1. Whey Protein Isolate ($49.99) — proteins
2. BCAA Recovery Blend ($29.99) — proteins
3. Creatine Monohydrate ($24.99) — supplements
4. Daily Multivitamin ($19.99) — vitamins
5. Omega-3 Fish Oil ($22.99) — vitamins
6. Organic Spirulina Powder ($18.99) — superfoods
7. Plant-Based Protein ($39.99) — proteins
8. Vitamin D3 + K2 ($14.99) — vitamins
9. Pre-Workout Energy ($34.99) — supplements
10. Protein Energy Bars 12-pack ($29.99) — snacks
11. Collagen Peptides ($27.99) — supplements
12. Organic Acai Berry Powder ($21.99) — superfoods

Each product includes a `nutrition_info` JSONB field with relevant nutrition facts (calories, protein, serving size, etc.).

---

## Product Images

Products display category-themed SVG illustrations via the `ProductImage` component (`components/ProductImage.tsx`). Each category has a unique color palette and icon. Images come in three sizes:

- **small** (60x60) — used in cart item rows
- **medium** (full width x 160px) — used in product catalog cards
- **large** (full width x 320px) — used on the product detail page

No external image files are needed — everything is rendered as inline SVG.

---

## Frontend Pages

### Homepage (`/`)
- Public (no login required to browse)
- Hero banner with branding
- Search bar and category filter buttons
- Product grid with SVG product images, name, description, price, and "Add to Cart" button
- Logged-in users can add products directly; anonymous users see products but no add button

### Product Detail (`/products/[id]`)
- Large SVG product image
- Full product information with nutrition facts table
- Quantity selector and "Add to Cart" button
- Category badge and stock indicator

### Cart (`/cart`)
- Lists all cart items with product thumbnail images, quantity selectors, and remove buttons
- Shows line totals and subtotal
- "Proceed to Checkout" button
- Requires authentication

### Dashboard (`/dashboard`)
- Welcome banner with user name
- Stats grid: total orders, total spent, cart items, cart value
- Recent orders (last 5) with status badges
- Quick action links: browse products, view cart, order history
- User profile card with avatar, name, email, auth method
- Requires authentication

### Checkout (`/checkout`)
- Order summary with all items
- Shipping address textarea
- "Place Order" button
- Success screen with order ID and link to orders page

### Orders (`/orders`)
- Lists all user orders with status badges
- Expandable detail view showing order items and shipping address
- Links to product detail pages

---

## Cart Context

`CartContext.tsx` manages client-side cart state:

- **Authenticated users**: cart stored in backend via `/api/cart` endpoints
- **Guest users**: cart stored in `localStorage` under `nutrishop_guest_cart` key; product details fetched from `/api/products` for display
- **On login**: guest cart entries are automatically merged into the backend cart, then localStorage is cleared
- **On logout**: reverts to guest cart from localStorage
- Guest cart items use negative IDs (`-product_id`) to distinguish them from backend cart items
- Provides `addToCart`, `updateQuantity`, `removeItem`, `refresh` methods
- Exposes `itemCount` for the navbar cart badge

Provider hierarchy: `LanguageProvider` → `AuthProvider` → `CartProvider`

---

## Translation Keys

All e-commerce UI strings are translated in EN, FR, and AR:

| Namespace       | Keys                                     |
|-----------------|------------------------------------------|
| `categories.*`  | Product category names                   |
| `product.*`     | Product detail page strings              |
| `cart.*`        | Cart page strings                        |
| `checkout.*`    | Checkout page strings                    |
| `orders.*`      | Orders page strings                      |
| `status.*`      | Order status labels                      |
| `common.*`      | Shared strings (Add to Cart, Remove, etc.) |
| `home.*`        | Homepage hero and catalog strings        |
