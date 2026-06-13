# Libiduo — E-Commerce Store

A full-stack e-commerce web application for the Libiduo brand. Built for production from day one — fewer than 100 products at launch, targeting 500–5,000 visitors per month, dark luxury design, fully mobile-first.

---

## Live Stack

| Layer | Service | Notes |
|---|---|---|
| Hosting | Hostinger Cloud (Node.js) | Persistent Node.js process, no cold starts |
| Database | MySQL | Localhost connection on Hostinger — no external latency |
| Cache / Cart | Upstash Redis | HTTP-based Redis (no server process needed); auto-falls back to MySQL if not configured |
| Image storage | Cloudinary | 25 GB free tier; auto-falls back to local `/public/uploads/` if not configured |
| CDN + SSL + DNS | Cloudflare | Free plan — DNS points here, handles HTTPS automatically |
| Payments | COD (v1) → Stripe (v2) | Cash on Delivery at launch; Stripe wired but not active |
| Email | Resend | Transactional emails — order confirmation, shipping update |
| Auth | NextAuth.js v5 | Google OAuth + email/password credentials |
| Process manager | PM2 | Cluster mode, auto-restart on crash |

**Monthly cost: Hostinger Cloud plan + domain only. Everything else is free tier.**

---

## Tech Stack

**Frontend**
- Next.js 14 (App Router) · TypeScript · Tailwind CSS
- Zustand — cart state and drawer UI
- TanStack Query — server data caching
- React Hook Form + Zod — all form validation
- Axios · Lucide React · `next/image`

**Backend**
- Next.js API route handlers (no separate Express)
- Prisma ORM — type-safe MySQL, migrations
- NextAuth.js v5 — JWT sessions
- Zod validation on every API route
- Resend SDK — transactional email
- Cloudinary SDK — product image uploads
- Upstash Redis SDK — cart sessions

**Database:** MySQL via Prisma, hosted on the same Hostinger server.

---

## Project Structure

```
/src
  /app
    /api
      /auth/[...nextauth]/      NextAuth handler
      /auth/register/           Email/password registration
      /products/                Product list + single product (GET/POST/PUT/DELETE)
      /products/[slug]/reviews/ Product reviews (GET/POST/DELETE)
      /cart/                    Cart read + add item
      /cart/[itemId]/           Cart update quantity + remove item
      /orders/                  Create order + list user orders
      /orders/[id]/             Single order detail
      /admin/categories/        Admin — category CRUD
      /admin/orders/            Admin — list all orders + update status
      /admin/upload/            Admin — image upload (Cloudinary or local)
    /(landing)/page.tsx         Landing / marketing homepage
    /(store)
      /products/                Product listing with filters + pagination
      /products/[slug]/         Product detail — gallery, add to cart, reviews
      /cart/                    Cart page
      /checkout/                Checkout — address + COD order
      /orders/                  User order history
      /orders/[id]/             Order detail + status
      /account/                 Profile + address management
      /login/                   Login page
      /register/                Registration page
    /(admin)
      /admin/                   Dashboard
      /admin/products/          Product list
      /admin/products/new/      Create product
      /admin/products/[id]/edit Edit product
      /admin/categories/        Category management (parent/child hierarchy)
      /admin/orders/            Order list + status management

  /components
    /admin/
      CategoryManager           Parent/child category CRUD UI
      ProductForm               Product create/edit form with image upload
      OrderStatusSelect         Inline order status update
    /store/
      AddToCartButton           Add to cart + loading state
      CartDrawer                Slide-in cart drawer (Zustand-driven)
      FilterSidebar             Category + price range filters
      ProductCard               Product thumbnail card
      ProductGrid               Responsive product grid
      ProductImageGallery       Product detail image switcher
      ReviewForm                Star rating + comment submission
      DeleteReviewButton        Remove own review
      SortSelect                Price/date sort dropdown
    /layout/
      Navbar                    Store navbar with cart icon + session
      LandingNavbar             Landing page navbar
      Providers                 TanStack Query + session providers
    /ui/
      Pagination                Page-based pagination control

  /lib
    auth.ts                     NextAuth config (Google + credentials)
    cart.ts                     Cart operations — Redis primary, MySQL fallback
    cloudinary.ts               Cloudinary client config
    db.ts                       Prisma client singleton
    email.ts                    Resend send wrapper
    env.ts                      Typed + validated env variables (Zod)
    redis.ts                    Upstash Redis client (lazy init)
    resend.ts                   Resend client singleton
    stripe.ts                   Stripe client
    /emails/
      order-confirmation.ts     Order confirmation email template
      shipping-update.ts        Shipping update email template
    /validations/
      auth.ts · cart.ts · category.ts · order.ts · product.ts · review.ts

  /store
    cart-store.ts               Zustand cart store (fetchCart, addItem, updateItem, removeItem)

  /types
    cart.ts                     CartItem, Cart types
    index.ts                    ApiResponse<T>, shared types

  /middleware.ts                Route protection — admin guard, auth redirect

/prisma
  schema.prisma                 Full DB schema (see below)
  /migrations/                  Auto-generated migration history
```

---

## Database Schema

```prisma
model User          { id, email, passwordHash?, name?, role(USER|ADMIN), addresses, orders, reviews, createdAt, updatedAt, deletedAt? }
model Account       { NextAuth OAuth accounts linked to User }
model VerificationToken { NextAuth email verification }
model Product       { id, name, slug, description, price(Decimal), stock, images(JSON), tags(JSON?), categoryId, isActive, createdAt, updatedAt, deletedAt? }
model Category      { id, name, slug, parentId? (self-relation — supports parent/child hierarchy), products[] }
model CartSession    { key (cart:user:id or cart:guest:guestId), items(JSON), updatedAt }
model Order         { id, userId, items[], status(PENDING→CONFIRMED→SHIPPED→DELIVERED→CANCELLED→RETURNED), total(Decimal), shippingAddress(JSON), payment?, createdAt, updatedAt }
model OrderItem     { id, orderId, productId, quantity, unitPrice(Decimal) }
model Payment       { id, orderId, method(COD|STRIPE), stripeIntentId?, amount, currency(inr), status(PENDING|PAID|FAILED|REFUNDED) }
model Address       { id, userId, line1, line2?, city, state, pincode, isDefault }
model Review        { id, userId, productId, rating(1-5), comment?, createdAt }
```

---

## API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account with email + password |
| * | `/api/auth/[...nextauth]` | Public | NextAuth — login, logout, OAuth callback |
| GET | `/api/products` | Public | List products (filters: category, price, search; sort; pagination) |
| GET | `/api/products/[slug]` | Public | Single product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/[slug]` | Admin | Update product |
| DELETE | `/api/products/[slug]` | Admin | Soft-delete product |
| GET | `/api/products/[slug]/reviews` | Public | List reviews for product |
| POST | `/api/products/[slug]/reviews` | User | Submit review |
| DELETE | `/api/products/[slug]/reviews/[reviewId]` | User/Admin | Delete review |
| GET | `/api/cart` | Public | Get cart (by session or guest cookie) |
| POST | `/api/cart` | Public | Add item to cart |
| PUT | `/api/cart/[itemId]` | Public | Update cart item quantity |
| DELETE | `/api/cart/[itemId]` | Public | Remove cart item |
| POST | `/api/orders` | User | Create order from cart |
| GET | `/api/orders` | User | List current user's orders |
| GET | `/api/orders/[id]` | User | Single order detail |
| GET | `/api/admin/orders` | Admin | All orders (with filters) |
| PUT | `/api/admin/orders/[id]` | Admin | Update order status |
| GET | `/api/admin/categories` | Admin | List all categories |
| POST | `/api/admin/categories` | Admin | Create category |
| PUT | `/api/admin/categories/[id]` | Admin | Update category |
| DELETE | `/api/admin/categories/[id]` | Admin | Delete category |
| POST | `/api/admin/upload` | Admin | Upload product image |

---

## Cart Architecture

Cart uses **Upstash Redis as primary** and **MySQL as automatic fallback** — no configuration change needed to switch.

- **Key format:** `cart:user:<userId>` for logged-in users, `cart:guest:<guestId>` for guests
- Guest cart ID is stored in an `httpOnly` cookie (`gid`), 30-day expiry
- On login, guest cart is merged into the user cart
- All cart state on the client is managed by Zustand (`src/store/cart-store.ts`)
- Cart drawer opens automatically after adding an item

---

## Image Uploads

- **With Cloudinary configured:** uploaded to `libiduo/products/` folder, auto-transformed to 1200×1200 max, WebP/auto format
- **Without Cloudinary:** saved to `public/uploads/products/` and served as static files — useful for local development

---

## Environment Variables

```env
# Database (MySQL on localhost)
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/libiduo_dev"

# NextAuth
NEXTAUTH_SECRET="your-random-32-char-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Upstash Redis (optional — falls back to MySQL if empty)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Cloudinary (optional — falls back to local /public/uploads/ if empty)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Stripe (v2 — leave empty for COD-only launch)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Resend (transactional email)
RESEND_API_KEY=""
FROM_EMAIL="noreply@yourdomain.com"
```

---

## Local Development

```bash
# Install dependencies
npm install

# Set up the database
npx prisma migrate dev

# Start dev server
npm run dev
```

The app runs on `http://localhost:3000`. Redis and Cloudinary are optional — the app falls back to MySQL for cart storage and local disk for image uploads when those env vars are empty.

---

## Deployment (Hostinger)

1. Push to `main` — GitHub Actions SSHs into the server
2. `git pull && npm install && npm run build`
3. `pm2 reload libiduo` — zero-downtime restart
4. Nginx proxies port 3000 → 80/443; Cloudflare handles SSL + CDN

---

## Coding Conventions

- TypeScript strict mode everywhere — no `any`
- Zod schema validates every API route input before touching the database
- All API responses follow `{ success: true, data: T }` / `{ success: false, error: string }`
- Prisma for all DB access — no raw SQL
- Server Components by default; `"use client"` only when required
- All env vars accessed through typed `src/lib/env.ts` — fails at startup if required vars are missing
- Soft deletes on User and Product (`deletedAt`) — never hard delete
- Monetary values stored as `Decimal(10,2)` in DB

---

## What's Built vs. Planned

| Feature | Status |
|---|---|
| Auth — email/password + Google OAuth | Done |
| Product catalog — list, detail, filters, sort, pagination | Done |
| Admin — product CRUD + image upload | Done |
| Admin — category management (parent/child) | Done |
| Cart — Redis + MySQL fallback, guest + user | Done |
| Orders — create, list, detail | Done |
| Admin — order list + status management | Done |
| Reviews — submit, display, delete | Done |
| Email — order confirmation + shipping update templates | Done (Resend wired, send logic ready) |
| Checkout — COD flow | Done |
| Payments — Stripe | Planned (v2) |
| Discount codes / coupons | Planned (v2) |
| Wishlist | Planned (v2) |
| Full-text search (Elasticsearch) | Planned (later) |
| Mobile app | Not in scope |
