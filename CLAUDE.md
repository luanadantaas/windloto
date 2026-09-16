@AGENTS.md

# WindLOTO Storefront — Claude Specifications

## Project Overview
Headless Shopify storefront for WindLOTO (windloto.com), a manufacturer of wind turbine locking devices (Ram Lock and Rotor Lock). Built with Next.js 16 App Router, Tailwind CSS, and TypeScript. Client manages products/pricing in Shopify admin; this repo is the custom frontend.

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 (inline config via `globals.css`, no `tailwind.config.ts`)
- **Language:** TypeScript
- **State:** Zustand with localStorage persistence
- **Backend:** Shopify Storefront API (GraphQL, via native `fetch` with Next.js caching)
- **Deployment:** Vercel (planned)

## Brand Colors
- Navy (primary): `#0f2d5a`
- Navy dark: `#0a1f3f`
- Orange (accent): `#f97316`
- Background: `#f8fafc`

Always use these exact hex values. Never introduce new brand colors without confirmation.

## Project Structure
```
src/
├── app/
│   ├── actions/checkoutActions.ts   # Server action: creates Shopify cart, redirects to checkout
│   ├── api/revalidate/route.ts      # Webhook: Shopify triggers cache revalidation on product update
│   ├── cart/page.tsx                # Cart page (client component)
│   ├── contact/page.tsx             # Contact page with US and international forms
│   ├── products/[handle]/page.tsx   # Dynamic product detail page
│   ├── ram-lock/page.tsx            # Ram Lock marketing page
│   ├── rotor-lock/page.tsx          # Rotor Lock marketing page
│   ├── rotor-lock-comparison/page.tsx
│   ├── store/page.tsx               # Store listing page
│   ├── globals.css                  # Tailwind v4 config + CSS variables
│   └── layout.tsx                  # Root layout with Header + Footer
├── components/
│   ├── AddToCartButton.tsx          # Client: adds variant to Zustand cart
│   ├── Footer.tsx                   # Site footer
│   ├── Header.tsx                   # Sticky nav with cart badge (SSR-safe)
│   ├── Hero.tsx                     # Homepage hero section
│   ├── ProductCard.tsx              # Product grid card with clean URL handle
│   ├── ProductImageGallery.tsx      # Client: main image + clickable thumbnails + arrows
│   ├── ShippingEstimator.tsx        # Client: ZIP-based shipping rate estimator
│   └── VariantSelector.tsx          # Client: generic option selector (color swatches + order type)
├── lib/
│   ├── cartStore.ts                 # Zustand cart store with persist middleware
│   ├── productHandleMap.ts          # Maps clean URL handles ↔ Shopify handles
│   ├── queries/products.ts          # GraphQL queries: GET_ALL_PRODUCTS, GET_PRODUCT_BY_HANDLE
│   └── shopify.ts                   # shopifyFetch: native fetch wrapper with Next.js cache
└── types/
    └── shopify.ts                   # TypeScript interfaces for Shopify API responses
```

## Environment Variables
```
SHOPIFY_STORE_DOMAIN=windloto-dev.myshopify.com     # Server-side only
SHOPIFY_STOREFRONT_ACCESSTOKEN=<token>               # Server-side only
NEXT_PUBLIC_APP_URL=https://windloto.com
REVALIDATE_SECRET=<random-secret>                    # Protects /api/revalidate webhook
```
Never use `NEXT_PUBLIC_` prefix for Shopify credentials — they must stay server-side.

## Key Architectural Decisions

### Product Handle Mapping (`src/lib/productHandleMap.ts`)
Shopify product handles may differ from the clean URL handles used in the app. The mapper decouples them. Always add new products here if the Shopify handle doesn't match the intended URL slug.
```ts
// URL /products/ram-lock → Shopify handle ram-locking-device
'ram-lock': 'ram-locking-device'
```

### Shopify Client (`src/lib/shopify.ts`)
Uses native `fetch` with `next: { revalidate: 3600 }` (1-hour cache). For mutations (cart creation), always pass `revalidate: 0`. API version: `2026-07`.

### Cart Store (`src/lib/cartStore.ts`)
Persisted to localStorage as `windloto-shopify-cart`. Cart badge in Header uses `mounted` state to avoid SSR hydration mismatch — always follow this pattern for any component that reads from the store on initial render.

### Bulk Order Enforcement
Bulk Order (20+) variants must enforce a minimum of 20 units in THREE places:
1. `VariantSelector` — quantity input min/default
2. Cart page — minus button disabled at 20
3. `checkoutActions.ts` — server-side validation before Shopify cart creation

Bulk items are detected by checking if `selectedOptions` contains an option with "bulk" in the value, or if the cart item title contains "bulk".

### Variant Selector
`VariantSelector` is generic — it reads `product.options` from Shopify and renders:
- `Color` option → circular swatches
- All other options → button rows with prices
Never hardcode option names in new components; always read from `product.options`.

### Shipping Rates
Fixed rates hardcoded in `ShippingEstimator.tsx`. US detection uses 5-digit ZIP regex. To change rates, edit the `US_OPTIONS` and `INTL_OPTIONS` arrays in that file.

## ADR Documents
Located in `docs/adr/`. Read before making architectural changes.
- ADR 001: Shopify Headless setup and metafields
- ADR 002: Shopify GraphQL client and TypeScript types
- ADR 003: Zustand cart store
- ADR 004: Checkout flow via Shopify Cart API
- ADR 005: Vercel deployment and webhook revalidation
- ADR 006: Testing strategy (Jest + Testing Library + MSW)

## Development Commands
```bash
npm run dev       # Start dev server (Turbopack) at localhost:3000
npm run build     # Production build
npm run lint      # ESLint
```

## Coding Conventions
- All **server components** fetch data directly via `shopifyFetch`
- All **client components** that need interactivity use `'use client'` at the top
- Server Actions are in `src/app/actions/` and must begin with `'use server'`
- Component files use PascalCase; lib/utility files use camelCase
- No `any` types except where Shopify API response shapes are uncertain — document why
- Do not add `NEXT_PUBLIC_` to secrets — Shopify tokens stay server-side

## Testing (ADR 006 — not yet implemented)
When implementing tests:
- Test files go in `src/__tests__/` mirroring `src/` structure
- Reset Zustand store between tests to prevent state leakage
- Use MSW to mock Shopify GraphQL API — never hit the real API in tests
- Server actions are tested as plain async functions

## Git Conventions
- Commit messages use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
- Always commit and push after completing a feature
- Never commit `.env.local`
