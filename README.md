
## What We Are Building

A full-stack e-commerce web application built from scratch. The store will have fewer than 100 products at launch, targeting 500–5,000 visitors per month. The goal is a fast, mobile-friendly shopping experience with a working checkout, order management, and an admin panel to manage products and orders.

This is a real production application, not a prototype. Every decision should prioritise simplicity, low cost, and the ability to scale later without rewriting.

---

## Hosting & Infrastructure

| Layer | Service | Notes |
|---|---|---|
| Hosting | Hostinger Cloud (Node.js) | Already purchased — persistent Node.js process, no cold starts |
| Database | MySQL | Built into Hostinger Cloud plan — use localhost connection |
| Cache / Sessions | Upstash Redis | Free tier (HTTP-based Redis, works without a server process) |
| Image storage | Cloudinary | Free tier — 25 GB storage, 25 GB bandwidth/month |
| CDN + SSL + DNS | Cloudflare | Free plan — point domain here, handles HTTPS automatically |
| Payments | COD (v1) → Stripe (v2) | Cash on Delivery at launch; Stripe integration planned for v2 |
| Email | Resend | Free tier — 3,000 transactional emails/month |
| Auth (social) | Google OAuth | Free — via NextAuth.js |
| CI/CD | GitHub Actions | Auto-deploy to Hostinger via SSH on every push to main |
| Process manager | PM2 | Keeps Next.js alive, restarts on crash, cluster mode for all CPU cores |

**Monthly cost: only the Hostinger Cloud plan + domain (~$10–12/year). Everything else is free tier.**

No AWS, no Kubernetes, no Docker required. The architecture is designed to run as a single persistent Node.js process on one server.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom design tokens
- **State (client):** Zustand — for cart, auth, UI state
- **State (server):** React Query (TanStack Query) — for products, orders, caching
- **Forms:** React Hook Form + Zod validation
- **HTTP client:** Axios
- **Auth:** NextAuth.js (credentials + Google OAuth)
- **Payments frontend:** Stripe.js
- **Image handling:** Next.js Image component — WebP, lazy loading
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js 20 (persistent — not serverless)
- **Framework:** Next.js API routes (App Router route handlers) — no separate Express server needed
- **ORM:** Prisma — type-safe MySQL queries, migrations
- **Auth:** NextAuth.js with JWT + refresh tokens
- **Validation:** Zod on every API route
- **Payments:** Stripe Node.js SDK
- **Email:** Resend SDK
- **Cache:** Upstash Redis SDK (`@upstash/redis`)
- **File uploads:** Cloudinary SDK

### Database
- **Engine:** MySQL (via Prisma ORM)
- **Host:** `localhost` (same server as app — fast, no external latency)

---

## Architecture Pattern

**Modular monolith** — one Next.js application, structured by feature module. This is not microservices. Each module (auth, products, orders, payments, notifications) is a self-contained folder. We can split into separate services later if needed, but for launch this is the correct approach.

```
/src
  /app                        ← Next.js App Router pages and API routes
    /api
      /auth/[...nextauth]/    ← NextAuth handler
      /products/              ← Product CRUD
      /cart/                  ← Cart operations
      /orders/                ← Order management
      /payments/              ← Stripe intents and webhooks
      /admin/                 ← Admin-only routes (protected)
    /(store)                  ← Public storefront pages
      /page.tsx               ← Homepage
      /products/
      /products/[slug]/
      /cart/
      /checkout/
      /orders/
      /account/
    /(admin)                  ← Admin panel pages (protected)
      /dashboard/
      /products/
      /orders/
  /components
    /ui/                      ← Reusable primitives (Button, Input, Badge…)
    /store/                   ← Store-specific components (ProductCard, CartDrawer…)
    /admin/                   ← Admin-specific components
    /layout/                  ← Navbar, Footer, MobileNav
  /lib
    /db.ts                    ← Prisma client singleton
    /redis.ts                 ← Upstash Redis client
    /stripe.ts                ← Stripe client
    /cloudinary.ts            ← Cloudinary config
    /auth.ts                  ← NextAuth config
    /validations/             ← Zod schemas
  /hooks/                     ← Custom React hooks
  /store/                     ← Zustand stores
  /types/                     ← Global TypeScript types
/prisma
  /schema.prisma              ← Database schema
  /migrations/                ← Auto-generated migrations
```

---

## Database Schema (Prisma / MySQL)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  name          String?
  role          Role      @default(USER)
  addresses     Address[]
  orders        Order[]
  reviews       Review[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
}

model Product {
  id          String        @id @default(cuid())
  name        String
  slug        String        @unique
  description String        @db.Text
  price       Decimal       @db.Decimal(10, 2)
  stock       Int           @default(0)
  images      String        @db.Text   // JSON array of Cloudinary URLs
  tags        String?                  // JSON array
  categoryId  String
  category    Category      @relation(fields: [categoryId], references: [id])
  orderItems  OrderItem[]
  reviews     Review[]
  isActive    Boolean       @default(true)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  deletedAt   DateTime?
}

model Category {
  id        String     @id @default(cuid())
  name      String
  slug      String     @unique
  products  Product[]
}

model Order {
  id              String      @id @default(cuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  items           OrderItem[]
  status          OrderStatus @default(PENDING)
  total           Decimal     @db.Decimal(10, 2)
  shippingAddress Json
  payment         Payment?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model OrderItem {
  id         String   @id @default(cuid())
  orderId    String
  order      Order    @relation(fields: [orderId], references: [id])
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  quantity   Int
  unitPrice  Decimal  @db.Decimal(10, 2)
}

model Payment {
  id              String        @id @default(cuid())
  orderId         String        @unique
  order           Order         @relation(fields: [orderId], references: [id])
  stripeIntentId  String        @unique
  amount          Decimal       @db.Decimal(10, 2)
  currency        String        @default("inr")
  status          PaymentStatus @default(PENDING)
  createdAt       DateTime      @default(now())
}

model Address {
  id         String  @id @default(cuid())
  userId     String
  user       User    @relation(fields: [userId], references: [id])
  line1      String
  line2      String?
  city       String
  state      String
  pincode    String
  isDefault  Boolean @default(false)
}

model Review {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  rating     Int
  comment    String?  @db.Text
  createdAt  DateTime @default(now())
}

enum Role          { USER ADMIN }
enum OrderStatus   { PENDING CONFIRMED SHIPPED DELIVERED CANCELLED RETURNED }
enum PaymentStatus { PENDING PAID FAILED REFUNDED }
```

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Create account |
| POST | /api/auth/[...nextauth] | Public | NextAuth login/logout |
| GET | /api/products | Public | List products (with filters, pagination) |
| GET | /api/products/[slug] | Public | Single product |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/[slug] | Admin | Update product |
| DELETE | /api/products/[slug] | Admin | Soft delete product |
| GET | /api/cart | User | Get cart (from Redis) |
| POST | /api/cart | User | Add item to cart |
| PUT | /api/cart/[itemId] | User | Update cart item quantity |
| DELETE | /api/cart/[itemId] | User | Remove cart item |
| POST | /api/orders | User | Create order from cart |
| GET | /api/orders | User | List user's orders |
| GET | /api/orders/[id] | User | Single order |
| POST | /api/payments/intent | User | Create Stripe payment intent (v2) |
| POST | /api/payments/webhook | Public | Stripe webhook — confirm payment (v2) |
| GET | /api/admin/orders | Admin | All orders |
| PUT | /api/admin/orders/[id] | Admin | Update order status |

---

## Key Pages

| Route | Description |
|---|---|
| `/` | Homepage — hero banner, featured products, categories |
| `/products` | Product listing with filter sidebar (category, price range, sort) |
| `/products/[slug]` | Product detail — images, description, add to cart, reviews |
| `/cart` | Cart page |
| `/checkout` | Checkout form — address + Stripe payment |
| `/orders` | User's order history |
| `/orders/[id]` | Order detail + status tracking |
| `/account` | Profile, addresses, password change |
| `/admin` | Admin dashboard |
| `/admin/products` | Product management — create, edit, delete |
| `/admin/orders` | Order management — view, update status |

---

## Mobile-First Rules

- All layouts built mobile-first, then adapted for desktop
- Minimum touch target size: 48×48px
- Bottom navigation bar on mobile (Home, Categories, Cart, Account)
- Cart as slide-in drawer on mobile, sidebar on desktop
- Product grid: 1 column on mobile, 2 on tablet, 3–4 on desktop
- All images: WebP format, lazy loaded, aspect ratio preserved to prevent layout shift
- Sticky add-to-cart button on product detail page on mobile

---

## Environment Variables

```env
# Database (MySQL on localhost)
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/ecom_db"

# NextAuth
NEXTAUTH_SECRET="your-random-32-char-secret"
NEXTAUTH_URL="https://yourdomain.com"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Upstash Redis
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Resend (email)
RESEND_API_KEY=""
FROM_EMAIL="noreply@yourdomain.com"
```

---

## Deployment

- **Server:** Hostinger Cloud with Node.js
- **Process manager:** PM2 (`pm2 start ecosystem.config.js`)
- **Reverse proxy:** Nginx (configured via Hostinger hPanel) — port 3000 → 80/443
- **SSL:** Cloudflare (free) — domain DNS points to Cloudflare, proxied to Hostinger
- **CI/CD:** GitHub Actions — SSH into server on push to `main`, runs `git pull → npm install → npm run build → pm2 reload`

---

## SEO Strategy

Every page targets a high Lighthouse SEO score (90+). The approach:

### Metadata (Next.js App Router)
- **Root layout** sets `metadataBase`, default `title` template (`%s | Libiduo`), global `description`, `openGraph`, and `twitter` card defaults
- **Static pages** (`/products`, `/orders`) export a `metadata` const
- **Dynamic pages** (`/products/[slug]`) use `generateMetadata()` to pull real product name, description, and first image from the DB
- Private pages (`/checkout`, `/orders`, `/account`) are marked `robots: { index: false }` — Google won't index them

### Structured Data (JSON-LD)
- Every product detail page injects a `<script type="application/ld+json">` with `schema.org/Product` including:
  - `name`, `description`, `image`, `sku`
  - `Offer` block: price, currency (INR), `InStock`/`OutOfStock`
  - `AggregateRating` block (when reviews exist) — enables Google star snippets in search results

### Sitemap & Robots
- `app/sitemap.ts` — dynamically generated; includes homepage, `/products`, all category filter URLs, and every active product slug with `lastModified` timestamps
- `app/robots.ts` — blocks `admin/`, `api/`, `checkout`, `orders`, `account`, `cart` from indexing; points to sitemap

### OpenGraph & Social Sharing
- Product pages include OG image (first product image, 1200×1200), title, and description
- Facebook `product:price:amount` + `product:price:currency` meta tags on product pages
- Twitter `summary_large_image` card on product pages

### Core Web Vitals (built-in)
- All images use `next/image` — automatic WebP conversion, lazy loading, `sizes` attribute, no layout shift
- Fonts loaded via `next/font/local` — zero render-blocking
- Server Components by default — minimal JS sent to client
- Milestone 10 adds a full Lighthouse audit before launch

---

## What NOT to Build (out of scope for launch)

- Mobile app (React Native) — add later
- Elasticsearch / full-text search — use MySQL LIKE queries for now, add later
- Microservices / Docker / Kubernetes — not needed at this scale
- Wishlist — nice to have, not for v1
- Discount codes / coupons — add in v2
- Multi-vendor / marketplace — not in scope

---

## Coding Conventions

- TypeScript strict mode everywhere — no `any`
- Zod schema for every API route input — validate before touching the database
- Prisma for all database access — no raw SQL except for complex reporting queries
- All API responses follow this shape:
  ```ts
  { success: true, data: T }
  { success: false, error: string }
  ```
- Server Components by default in Next.js App Router — use `"use client"` only when needed
- Environment variables accessed only through a typed `/src/lib/env.ts` module
- Soft deletes on User and Product (`deletedAt` field) — never hard delete
- All monetary values stored as `Decimal` in DB and handled in paise/cents as integers in code to avoid floating point issues

---

## Build Order

1. Project scaffold + Prisma schema + DB migration + env setup
2. Auth — register, login, Google OAuth, session
3. Product catalog — list, detail, admin CRUD + Cloudinary upload
4. Cart — Redis-based guest and user cart
5. Checkout + COD order creation (Stripe deferred to v2)
6. Order history and status pages
7. Admin panel — orders and products management
8. Email notifications — order confirmation, shipping update
9. Reviews + ratings
10. Performance — image optimisation, caching headers, Core Web Vitals audit