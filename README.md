# WindLOTO Storefront

Headless Shopify storefront for **WindLOTO** — a manufacturer of precision locking devices for wind turbine maintenance. Built with Next.js 16 App Router, Tailwind CSS v4, TypeScript, and Zustand.

**Products sold:** Ram Lock · Rotor Lock (US Patent #8720479)  
**Markets:** USA / Canada (direct) · Europe & South America (via Sister-Soft distributor)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 (CSS-first config in `globals.css`) |
| Language | TypeScript |
| State | Zustand v5 with `localStorage` persistence |
| Commerce backend | Shopify Storefront API (GraphQL, version `2026-07`) |
| Deployment target | Vercel (ISR + webhook revalidation) |
| Tests | Jest 30 + Testing Library + MSW v2 |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/luanadantaas/windloto.git
cd windloto
npm install
```

### 2. Set environment variables

Create `.env.local` at the project root (never commit this file):

```env
SHOPIFY_STORE_DOMAIN=windloto-dev.myshopify.com
SHOPIFY_STOREFRONT_ACCESSTOKEN=your_storefront_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
REVALIDATE_SECRET=any_random_secret
```

> **Security:** `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESSTOKEN` are server-side only. Never use `NEXT_PUBLIC_` for Shopify credentials.

### 3. Run the dev server

```bash
npm run dev        # Turbopack dev server at http://localhost:3000
```

---

## Project Structure

```
src/
├── app/
│   ├── actions/
│   │   └── checkoutActions.ts      # Server Actions: cart creation, coupon validation
│   ├── api/revalidate/route.ts     # Shopify webhook → ISR cache revalidation
│   ├── cart/page.tsx               # Cart page with discount codes and shipping estimator
│   ├── contact/page.tsx            # Contact forms (US + international)
│   ├── products/[handle]/page.tsx  # Dynamic product detail page
│   ├── ram-lock/page.tsx           # Ram Lock marketing page
│   ├── rotor-lock/page.tsx         # Rotor Lock marketing page
│   ├── rotor-lock-comparison/page.tsx
│   ├── store/page.tsx              # Product listing
│   ├── globals.css                 # Tailwind v4 config + CSS variables
│   └── layout.tsx                  # Root layout (Header + Footer)
├── components/
│   ├── AddToCartButton.tsx         # Adds variant to Zustand cart
│   ├── Footer.tsx
│   ├── Header.tsx                  # Sticky nav, cart badge, responsive drawer
│   ├── Hero.tsx                    # Homepage hero
│   ├── ProductCard.tsx             # Store grid card
│   ├── ProductImageGallery.tsx     # Image carousel + thumbnails
│   ├── ShippingEstimator.tsx       # ZIP-based shipping rate estimator
│   └── VariantSelector.tsx         # Color swatches + order type selector
├── lib/
│   ├── cartStore.ts                # Zustand cart store
│   ├── productHandleMap.ts         # URL slug ↔ Shopify handle mapping
│   ├── queries/products.ts         # GraphQL queries
│   └── shopify.ts                  # shopifyFetch wrapper
├── mocks/
│   ├── handlers.ts                 # MSW v2 GraphQL handlers
│   └── server.ts                   # MSW server for integration tests
└── types/shopify.ts                # TypeScript interfaces for Shopify API
```

---

## Key Features

### Cart & Checkout
- Zustand cart persisted to `localStorage`
- Shopify `cartCreate` mutation generates a hosted checkout URL
- Bulk Order enforcement: Rotor Lock bulk variant requires ≥ 20 units (validated in the UI, cart page, and server action)
- Stock limits from Shopify `quantityAvailable` — `null` means tracking is off (unlimited)

### Discount Codes
Validated via a temporary `cartCreate` call before checkout. Returns one of:
- `discountType: 'amount'` — product or order discount (non-zero `discountAllocations` on line items)
- `discountType: 'free_shipping'` — shipping discount (zero line-item allocations)

> **API limitation:** the Shopify Storefront API cannot distinguish a free shipping code from a valid product code whose target isn't in the cart. Both return `applicable: true` with empty allocations. See ADR-007.

### Product Variants
- `VariantSelector` renders color swatches for `Color` options and button rows for all other options
- Expanded `COLOR_MAP` covers safety colors, industrial finishes, and common descriptives
- Unknown colors fall back to a text pill (no broken gray circle)

### Cache Strategy
- Product pages: ISR with 1-hour revalidation (`revalidate: 3600`)
- Cart mutations: always bypass cache (`revalidate: 0`)
- Shopify webhook at `/api/revalidate` triggers `revalidatePath` on product updates

---

## Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Jest — all tests, no coverage
npm run test:watch   # Jest watch mode
npm run test:coverage  # Jest with coverage report
```

### Running a single test file

```bash
npx jest --testPathPatterns="VariantSelector"
```

---

## Testing

Tests live under `src/__tests__/` mirroring the `src/` structure.

```
src/__tests__/
├── actions/checkoutActions.test.ts   # Server actions + all 4 Shopify discount types
├── components/
│   ├── AddToCartButton.test.tsx
│   ├── Header.test.tsx
│   ├── ProductImageGallery.test.tsx
│   ├── ShippingEstimator.test.tsx
│   └── VariantSelector.test.tsx      # Color swatches, stock limits, quantity
└── lib/
    ├── cartStore.test.ts
    ├── productHandleMap.test.ts
    └── shippingZip.test.ts
```

**Stack:** Jest 30 · `@testing-library/react` v16 · `@testing-library/user-event` v14 · MSW v2 (available for integration tests)

Zustand store is reset between tests:
```ts
useCartStore.setState({ cart: [], shopifyCartId: null })
```

---

## Architecture Decisions

Full ADR documents are in `docs/adr/`:

| ADR | Topic |
|-----|-------|
| ADR-001 | Shopify headless setup and metafields |
| ADR-002 | Shopify GraphQL client and TypeScript types |
| ADR-003 | Zustand cart store |
| ADR-004 | Checkout flow via Shopify Cart API |
| ADR-005 | Vercel deployment and webhook revalidation |
| ADR-006 | Testing strategy (Jest + Testing Library + MSW) |
| ADR-007 | Shopify Storefront API specification |

---

## Deployment

> See ADR-005 and `docs/ROADMAP.md` for full deployment tasks. Below is the abbreviated checklist.

1. Connect this repo to a Vercel project
2. Add all env vars in the Vercel dashboard (same as `.env.local`, scoped to Production)
3. Set `NEXT_PUBLIC_APP_URL` to `https://windloto.com`
4. Point `windloto.com` DNS to Vercel nameservers
5. Add Shopify webhooks in Shopify Admin → Settings → Notifications:
   - `products/update` → `https://windloto.com/api/revalidate`
   - `products/create` → `https://windloto.com/api/revalidate`

---

## Brand

| Token | Value |
|---|---|
| Primary (navy) | `#0f2d5a` |
| Primary dark | `#0a1f3f` |
| Accent (orange) | `#f97316` |
| Background | `#f8fafc` |

Always use these exact hex values. Do not introduce new brand colors without confirmation.
