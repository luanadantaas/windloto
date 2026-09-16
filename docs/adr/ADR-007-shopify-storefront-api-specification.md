# ADR 007: Shopify Storefront API Specification
**Status:** Approved

---

## Context

The WindLOTO storefront integrates with Shopify as its backend commerce engine. All product data, inventory, cart creation, checkout, and discount validation go through Shopify's **Storefront API** (GraphQL). This document records every integration decision: what fields are queried, how mutations are structured, known API limitations, and why certain detection strategies were chosen.

---

## Decision

Use Shopify Storefront API version `2026-07` exclusively. All API calls are server-side (no client-side token exposure). Cart creation is used both for checkout redirection and for coupon code validation.

---

## API Client

**File:** `src/lib/shopify.ts`

```ts
shopifyFetch<T>({ query, variables, revalidate? }): Promise<T>
```

- Endpoint: `https://${SHOPIFY_STORE_DOMAIN}/api/2026-07/graphql.json`
- Authentication header: `X-Shopify-Storefront-Access-Token`
- Default cache: `next: { revalidate: 3600 }` (1-hour ISR)
- Mutations always pass `revalidate: 0` to bypass the cache

**Environment variables (server-side only — never `NEXT_PUBLIC_`):**
```
SHOPIFY_STORE_DOMAIN=windloto-dev.myshopify.com
SHOPIFY_STOREFRONT_ACCESSTOKEN=<token>
```

---

## Product Queries

### `GET_ALL_PRODUCTS`

Fetches the product listing for `/store`. Returns up to 20 products.

**Fields fetched per product:**
- `id`, `title`, `handle`, `description`
- `priceRange.minVariantPrice { amount, currencyCode }`
- `images(first: 1) → edges → node { url, altText }`
- `variants(first: 10) → edges → node { id, title, availableForSale, quantityAvailable, price { amount, currencyCode }, selectedOptions { name, value } }`

### `GET_PRODUCT_BY_HANDLE`

Fetches a single product for `/products/[handle]`. Returns the full variant set.

**Fields fetched per product:** same as above, plus:
- `images(first: 10)` (full gallery for ProductImageGallery)
- `options { name, values }` (drives VariantSelector rendering)

**Key design choice:** `quantityAvailable` is fetched on every variant. When `null`, Shopify is not tracking inventory for that variant — treat as unlimited stock. When a number, enforce it as the `+` button ceiling in VariantSelector and the cart page.

---

## Variant Shape (`ShopifyVariant`)

```ts
interface ShopifyVariant {
  id: string                           // "gid://shopify/ProductVariant/<id>"
  title: string
  availableForSale: boolean
  quantityAvailable: number | null     // null = inventory tracking off
  price: { amount: string; currencyCode: string }
  selectedOptions: Array<{ name: string; value: string }>
}
```

---

## Cart Mutations

### Checkout cart (`CREATE_CART_MUTATION`)

Used in `createShopifyCheckoutAction`. Creates a cart and redirects the customer to Shopify's hosted checkout.

```graphql
mutation cartCreate($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
    }
    userErrors { field message }
  }
}
```

**Input shape:**
```ts
{
  lines: Array<{ merchandiseId: string; quantity: number }>,
  discountCodes?: string[]   // only present when a coupon is active
}
```

**Business rule enforced before the mutation:** Bulk Order variant `gid://shopify/ProductVariant/46578637930566` requires `quantity >= 20`. The server action throws before calling Shopify if this is violated.

---

### Coupon validation cart (`VALIDATE_COUPON_MUTATION`)

Used in `validateCouponAction`. Creates a **temporary** cart (never redirected to) solely to check whether a discount code is valid and to compute the discount amount.

```graphql
mutation cartCreateValidate($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      discountCodes {
        applicable
        code
      }
      lines(first: 20) {
        edges {
          node {
            discountAllocations {
              discountedAmount { amount currencyCode }
            }
          }
        }
      }
    }
    userErrors { field message }
  }
}
```

**Why a separate cart mutation?** The Storefront API does not expose a standalone "validate coupon" endpoint. Creating a cart with `discountCodes` and inspecting the result is the standard pattern for coupon validation without committing to a checkout session.

---

## Coupon / Discount Code Validation

### Return type

```ts
type CouponValidationResult =
  | { valid: false; discountAmount: 0; currency: string; discountType: null; errorMessage: string }
  | { valid: true; discountAmount: number; currency: string; discountType: 'amount' | 'free_shipping' }
```

### Validation steps

1. **Shopify `userErrors`** — API-level errors (malformed input, quota exceeded). Returned as `valid: false` with the Shopify message.
2. **`discountCodes[0].applicable === false`** — The code is unrecognised or expired. Returned as `valid: false` with a generic "Invalid or expired discount code." message.
3. **Sum `discountAllocations`** across all cart lines — the total product/order discount amount.
4. **Discount type detection** — see below.

---

## Discount Type Detection

The Storefront API does not expose the discount type (product, order, shipping) directly. It is inferred from `discountAllocations`:

| Scenario | `applicable` | `discountAllocations` | Detected as |
|---|---|---|---|
| Amount off products — item in cart | `true` | `> $0` on affected lines | `'amount'` |
| Buy X Get Y — conditions met | `true` | Free item's full price on Y lines | `'amount'` |
| Amount off order | `true` | Amounts distributed proportionally across all lines | `'amount'` |
| Free shipping | `true` | Empty on all lines | `'free_shipping'` |
| Amount off products — item NOT in cart | `true` | Empty on all lines | `'free_shipping'` ⚠️ |
| Buy X Get Y — minimum quantity not met | `true` | Empty on all lines | `'free_shipping'` ⚠️ |
| Invalid / expired code | `false` | N/A | `valid: false` |

### Detection rule

```ts
const discountType = totalDiscount === 0 ? 'free_shipping' : 'amount'
```

### ⚠️ Storefront API limitation

Cases marked above are **indistinguishable via the Storefront API**: a valid product discount code whose target product is absent from the cart, and a Buy X Get Y code whose minimum is not yet met, both return `applicable: true` with empty `discountAllocations` — the same response as a free shipping discount.

**Consequence in the UI:** these edge cases are labelled as "Free Shipping" in the cart order summary, which may be misleading. The actual discount will apply correctly at Shopify checkout when conditions are met.

**Resolving the ambiguity** (not yet implemented): the Shopify **Admin API** exposes the discount type directly via `DiscountNode`. This would require a server-side Admin API call keyed on the discount code. Implement if user confusion from the edge cases becomes a support burden.

---

## Discount Types — How Each Manifests in the API

### 1. Product discount — Amount off products

Shopify emits a `discountAllocation` on the line item(s) whose product matches the discount target. Other line items receive no allocation. The allocation amount is the actual saved amount (e.g., 10% off a $62.50 item = $6.25 allocation).

### 2. Product discount — Buy X Get Y

When the cart satisfies the "Buy X" minimum, the free "Y" items each receive a `discountAllocation` equal to their full unit price (100% off those units). If the minimum is not met, no allocations are produced — see limitation above.

### 3. Order discount — Amount off order

Shopify distributes the discount proportionally across all eligible line items. A $20 flat discount on a cart with two lines may appear as `$13.33` on line 1 and `$6.67` on line 2. The sum of all allocations equals the total discount amount.

### 4. Shipping discount — Free shipping

No `discountAllocations` appear on any line item. The discount applies to the shipping cost, which is only computed at Shopify checkout (not available via the Storefront API cart). The storefront detects this via the zero-sum rule above and suppresses the shipping estimator, showing a "Free Shipping" badge instead.

---

## Inventory / Stock Tracking

`quantityAvailable` on a `ShopifyVariant` has two states:

| Value | Meaning | UI behaviour |
|---|---|---|
| `null` | Shopify inventory tracking is **off** for this variant | No stock limit; `+` button always enabled; no "Only X left" badge |
| `number` | Tracked stock level | `+` button disabled at this ceiling; badge shown when `<= 10` |

The `null` path is important: many Shopify configurations do not track inventory. Treating `null` as zero would break the storefront for every untracked product.

**`CartLineItem` carries `stockLimit: number | null`** so the cart page can enforce the same ceiling without a second API call.

---

## Cache Revalidation

On product update in Shopify admin, a webhook `POST /api/revalidate` triggers `revalidatePath('/')` and `revalidatePath('/store')`. The webhook endpoint is protected by `REVALIDATE_SECRET` to prevent arbitrary cache invalidation.

Product detail pages (`/products/[handle]`) are ISR with `revalidate: 3600`. They are not explicitly revalidated on the webhook; a 1-hour stale window is acceptable for product data.

---

## Handle Mapping

Shopify product handles (set in admin) may differ from clean URL slugs used in the app. The mapping lives in `src/lib/productHandleMap.ts`:

```ts
// URL /products/ram-lock → Shopify query uses handle "ram-locking-device"
'ram-lock': 'ram-locking-device'
```

Any new product whose desired URL slug differs from its Shopify handle must be added here.

---

## Known Limitations

1. **No discount type in Storefront API** — described in detail above.
2. **No real-time shipping rates** — `ShippingEstimator` uses hardcoded rates; actual Shopify shipping rates require the Admin API or a carrier service integration.
3. **Checkout URL, not embedded checkout** — `checkoutUrl` opens Shopify's hosted checkout. Shopify Storefront API v2 embedded checkout (Hydrogen) is not used.
4. **Cart is ephemeral** — The cart created for coupon validation is never retrieved again. The `shopifyCartId` stored in Zustand is not currently used to resume a cart session across visits.
