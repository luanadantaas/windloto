# ADR 006: Testing Strategy
**Status:** Approved

---

## Context

The WindLOTO storefront has been built with several interconnected features: a Shopify Storefront API client, product handle mapping, a Zustand cart store, bulk order enforcement, a checkout server action, and a set of UI components (VariantSelector, ProductImageGallery, ShippingEstimator, etc.).

As the codebase grows and is handed off to production, regressions in business-critical flows — bulk pricing, cart totals, checkout redirects — must be caught before they reach the client. A structured test suite is required.

---

## Decision

Implement unit and component tests using **Jest** + **@testing-library/react**, with **MSW (Mock Service Worker)** to mock Shopify GraphQL API responses. Tests are organized into four phases by complexity and business priority.

---

## Testing Stack

| Tool | Purpose |
|------|---------|
| `jest` | Test runner |
| `@testing-library/react` | Component rendering and interaction |
| `jest-environment-jsdom` | Browser DOM simulation |
| `@testing-library/user-event` | Realistic user interactions |
| `msw` | Mock Shopify Storefront API GraphQL responses |

---

## Implementation Specification

### Phase 1 — Setup

**Files to create:**
- `jest.config.ts` — configure Next.js + TypeScript + `@/` alias resolution
- `jest.setup.ts` — import `@testing-library/jest-dom`, configure MSW server
- `src/mocks/handlers.ts` — MSW GraphQL handlers for Shopify product and cart queries
- `src/mocks/server.ts` — MSW server setup for Node environment

**Install:**
```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom msw ts-jest
```

---

### Phase 2 — Unit Tests (pure logic, no DOM)

**Priority: High** — These are pure functions with no dependencies. Fast to run, highest confidence per line of code.

| File | Test file | Cases |
|------|-----------|-------|
| `src/lib/productHandleMap.ts` | `__tests__/lib/productHandleMap.test.ts` | `resolveShopifyHandle` maps known handles, falls back to original for unknowns; `resolveUrlHandle` reverses correctly |
| `src/lib/cartStore.ts` | `__tests__/lib/cartStore.test.ts` | `addToCart` adds new item; increments quantity for existing item; `removeFromCart` removes by variantId; `updateQuantity` at 0 removes item; `totalItems` sums correctly; `totalPrice` calculates price × quantity |
| `src/app/actions/checkoutActions.ts` | `__tests__/actions/checkoutActions.test.ts` | Throws error when bulk variant quantity < 20; passes through when quantity ≥ 20; non-bulk variants have no minimum |
| `src/components/ShippingEstimator.tsx` (ZIP logic) | `__tests__/lib/shippingZip.test.ts` | 5-digit ZIP returns US options; ZIP+4 format passes; non-numeric string routes to international; empty string triggers error |
| `src/components/VariantSelector.tsx` (helper functions) | `__tests__/lib/variantHelpers.test.ts` | `findVariant` returns correct variant for given option selection; `isBulkVariant` detects bulk by selectedOptions; `getColorHex` maps known colors; returns null for unknown |

---

### Phase 3 — Component Tests (UI behavior)

**Priority: High** — Validates user-facing interaction contracts.

#### `ProductImageGallery`
```
- No arrows rendered when product has 1 image
- Arrows rendered when product has 2+ images
- Clicking › advances to next image
- Clicking ‹ goes to previous image
- Navigation loops: last image → first on ›
- Clicking thumbnail updates main image
- Selected thumbnail has orange border
```

#### `AddToCartButton`
```
- Renders "Add to Cart" initially
- Calls addToCart with correct variantId, price, quantity
- Shows "✓ Added to Cart" after click
- Reverts to "Add to Cart" after 2 seconds
- Renders disabled with "Out of Stock" when availableForSale is false
```

#### `VariantSelector`
```
- Renders color swatches for Color option
- Renders button rows for Order Type option
- Clicking color swatch updates selected state
- Clicking order type updates price shown
- findVariant called with correct combined options
- Quantity defaults to 1 for single variant
- Quantity defaults to 20 when bulk variant selected
- Minus button disabled at quantity minimum
- Switching from bulk to single resets quantity to 1
- Price summary shows unit price × quantity
- Bulk discount badge shown for bulk variant
```

#### `ShippingEstimator`
```
- Input and Calculate button rendered
- Empty zip shows error message
- US zip (e.g. "10001") shows USPS Priority, FedEx 2nd Day, FedEx Next Day
- Non-US input (e.g. "SW1A 1AA") shows International Postal, International DHL
- Selecting an option calls onSelect with correct ShippingOption
- First option auto-selected after calculate
- Free shipping shows green label
```

#### `Header`
```
- Cart badge not rendered on initial mount (SSR-safe)
- Cart badge renders with correct count after mount
- Badge hidden when cart is empty
- Mobile menu toggle shows/hides nav links
```

#### Cart Page
```
- Empty cart renders "Your cart is empty" with store link
- Cart items rendered with title, price, quantity
- Minus button disabled at quantity 1 for single items
- Minus button disabled at quantity 20 for bulk items
- Plus button increments quantity
- Remove button removes item from cart
- Order summary shows correct subtotal
- Shipping estimator section is visible inside the summary card
- Total updates when shipping option selected
- Checkout button calls createShopifyCheckoutAction
- Error message shown if checkout action throws
```

---

### Phase 4 — Integration Tests (full flows)

**Priority: Medium** — Validates end-to-end flows with MSW mocking the Shopify API.

#### Add to Cart → View Cart
```
1. Render product page (MSW returns mock product)
2. Select a variant
3. Click "Add to Cart"
4. Navigate to /cart
5. Assert item appears with correct title, price, quantity
```

#### Bulk Order Full Flow
```
1. Select "Bulk Order (20+)" variant on product page
2. Assert quantity defaults to 20
3. Assert minus button disabled at 20
4. Add to cart
5. Navigate to /cart
6. Assert minus button disabled at 20 in cart
7. Click Checkout
8. Assert createShopifyCheckoutAction called with quantity ≥ 20
```

#### Handle Mapper → Product Page
```
1. Navigate to /products/ram-lock
2. Assert MSW receives request for handle "ram-locking-device" (not "ram-lock")
3. Assert product title rendered on page
```

---

## Priority Order for Implementation

1. Cart store unit tests — most business logic
2. Handle mapper unit tests — pure, trivial
3. Checkout action unit tests — bulk rule is a hard business requirement
4. VariantSelector component tests — most complex component
5. ProductImageGallery component tests — clear interaction contract
6. ShippingEstimator component tests
7. AddToCartButton component tests
8. Header component tests
9. Cart page component tests
10. Integration tests

---

## Notes

- Test files live under `src/__tests__/` mirroring the `src/` structure
- MSW handlers should mirror the actual Shopify GraphQL schema to avoid false positives
- The Zustand store must be reset between tests using `beforeEach` to prevent state leakage
- Server Actions (`checkoutActions.ts`) are tested as plain async functions — no Next.js runtime needed
